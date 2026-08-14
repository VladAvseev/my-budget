import { supabase } from '../supabase';
import type { Database } from '../types/database.types';
import { PostgrestError } from '@supabase/supabase-js';
import { parseISO, toISODate } from '@/shared/utils/date';
import { trimStrings } from '@/shared/utils';

export type Operation = Database['public']['Tables']['operations']['Row'];
type OperationInsert = Database['public']['Tables']['operations']['Insert'];

export type OperationType = 'income' | 'expense' | 'savings' | 'savings_out' | 'daily';

export const isSavingsType = (type: OperationType): boolean =>
  type === 'savings' || type === 'savings_out';

export const operationSign = (type: OperationType): 1 | -1 => (type === 'savings_out' ? -1 : 1);

export const signedOperationAmount = (type: OperationType, amount: number): number =>
  amount * operationSign(type);

export interface OperationInput {
  type: OperationType;
  amount: number;
  categoryId?: string | null;
  description?: string | null;
  date?: string | null;
}

export type OperationUpdateInput = Partial<OperationInput>;

export interface DailyExpenseInput {
  amount: number;
  categoryId?: string | null;
  description?: string | null;
}

export interface OperationSummary {
  income: number;
  expense: number;
  savings: number;
  daily: number;
}

class OperationsService {
  async listOperations(reportId: string) {
    return supabase
      .from('operations')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: false });
  }

  async listOperationsByReports(reportIds: string[]): Promise<Operation[]> {
    if (reportIds.length === 0) return [];

    const all: Operation[] = [];
    const chunkSize = 50;
    const pageSize = 1000;

    for (let i = 0; i < reportIds.length; i += chunkSize) {
      const chunk = reportIds.slice(i, i + chunkSize);
      let start = 0;
      while (true) {
        const { data, error } = await supabase
          .from('operations')
          .select('report_id, type, amount, category_id')
          .in('report_id', chunk)
          .order('id', { ascending: true })
          .range(start, start + pageSize - 1);
        if (error) throw error;
        const rows = (data ?? []) as unknown as Operation[];
        all.push(...rows);
        if (rows.length < pageSize) break;
        start += pageSize;
      }
    }
    return all;
  }

  async listByType(reportId: string, type: OperationType) {
    const query = supabase
      .from('operations')
      .select('*')
      .eq('report_id', reportId)
      .eq('type', type);
    if (type === 'daily') {
      return query.order('date', { ascending: false }).order('created_at', { ascending: false });
    }
    return query.order('created_at', { ascending: false });
  }

  async listByTypeForUser(userId: string, type: OperationType) {
    return supabase
      .from('operations')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false });
  }

  async countOperations(userId: string) {
    return supabase
      .from('operations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
  }

  async createOperation(reportId: string, userId: string, input: OperationInput) {
    const insert: OperationInsert = {
      report_id: reportId,
      user_id: userId,
      type: input.type,
      amount: String(input.amount),
    };
    if (input.categoryId !== undefined) insert.category_id = input.categoryId;
    if (input.description !== undefined) insert.description = input.description;
    if (input.date !== undefined) insert.date = input.date;
    return supabase.from('operations').insert(trimStrings(insert)).select().single();
  }

  async updateOperation(id: string, input: OperationUpdateInput) {
    const updates: Database['public']['Tables']['operations']['Update'] = {};
    if (input.type !== undefined) updates.type = input.type;
    if (input.amount !== undefined) updates.amount = String(input.amount);
    if (input.categoryId !== undefined) updates.category_id = input.categoryId;
    if (input.description !== undefined) updates.description = input.description;
    if (input.date !== undefined) updates.date = input.date;
    return supabase.from('operations').update(trimStrings(updates)).eq('id', id).select().single();
  }

  async removeOperation(id: string) {
    return supabase.from('operations').delete().eq('id', id);
  }

  async removeDailyExpenses(reportId: string) {
    return supabase
      .from('operations')
      .delete()
      .eq('report_id', reportId)
      .eq('type', 'daily');
  }

  async getUserSummary(userId: string): Promise<OperationSummary> {
    const { data, error } = await supabase
      .from('operations')
      .select('type, amount')
      .eq('user_id', userId);
    if (error) throw error;
    const summary: OperationSummary = { income: 0, expense: 0, savings: 0, daily: 0 };
    for (const row of data ?? []) {
      const type = row.type as OperationType;
      const amount = Number(row.amount) || 0;
      if (type === 'savings_out') {
        summary.savings -= amount;
      } else if (type in summary) {
        summary[type as keyof OperationSummary] += amount;
      }
    }
    return summary;
  }

  async getSummary(reportId: string): Promise<OperationSummary> {
    const { data, error } = await supabase
      .from('operations')
      .select('type, amount')
      .eq('report_id', reportId);
    if (error) throw error;
    const summary: OperationSummary = { income: 0, expense: 0, savings: 0, daily: 0 };
    for (const row of data ?? []) {
      const type = row.type as OperationType;
      const amount = Number(row.amount) || 0;
      if (type === 'savings_out') {
        summary.savings -= amount;
      } else if (type in summary) {
        summary[type as keyof OperationSummary] += amount;
      }
    }
    return summary;
  }

  async getNextFreeDate(
    reportId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<string | null> {
    const start = parseISO(periodStart);
    const end = parseISO(periodEnd);
    if (!start || !end || start.getTime() > end.getTime()) return null;

    const { data, error } = await supabase
      .from('operations')
      .select('date')
      .eq('report_id', reportId)
      .eq('type', 'daily')
      .not('date', 'is', null);
    if (error) throw error;

    const used = new Set((data ?? []).map((row) => row.date ?? ''));
    const day = new Date(start);
    while (day.getTime() <= end.getTime()) {
      const iso = toISODate(day);
      if (!used.has(iso)) return iso;
      day.setDate(day.getDate() + 1);
    }
    return null;
  }

  async createDailyExpense(
    reportId: string,
    userId: string,
    input: DailyExpenseInput,
    periodStart: string,
    periodEnd: string,
  ) {
    const date = await this.getNextFreeDate(reportId, periodStart, periodEnd);
    if (!date) {
      const error: PostgrestError = new PostgrestError({
        message: 'Нет свободных дат в отчётном периоде',
        details: '',
        hint: '',
        code: 'P0001',
      });
      return { data: null, error };
    }
    return this.createOperation(reportId, userId, {
      type: 'daily',
      amount: input.amount,
      categoryId: input.categoryId,
      description: input.description,
      date,
    });
  }
}

export const operationsService = new OperationsService();
