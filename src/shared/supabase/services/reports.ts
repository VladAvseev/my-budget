import { supabase } from '../supabase';
import type { Database } from '../types/database.types';
import { trimStrings } from '@/shared/utils';

export type Report = Database['public']['Tables']['reports']['Row'];
type ReportInsert = Database['public']['Tables']['reports']['Insert'];

export interface ReportInput {
  name: string;
  hasDailyExpenses?: boolean;
  dailyBudget?: number | null;
  periodStart?: string | null;
  periodEnd?: string | null;
}

export type ReportUpdateInput = Partial<ReportInput>;

class ReportsService {
  async listReports() {
    return supabase.from('reports').select('*').order('created_at', { ascending: false });
  }

  async listReportsByUser(userId: string) {
    return supabase
      .from('reports')
      .select('id, name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }

  async countReports(userId: string) {
    return supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
  }

  async getReport(id: string) {
    return supabase.from('reports').select('*').eq('id', id).maybeSingle();
  }

  async createReport(input: ReportInput) {
    const insert: ReportInsert = {
      name: input.name,
      has_daily_expenses: input.hasDailyExpenses ?? false,
    };
    if (input.hasDailyExpenses) {
      insert.daily_budget = input.dailyBudget != null ? String(input.dailyBudget) : null;
      insert.period_start = input.periodStart ?? null;
      insert.period_end = input.periodEnd ?? null;
    }
    return supabase.from('reports').insert(trimStrings(insert)).select().single();
  }

  async updateReport(id: string, input: ReportUpdateInput) {
    const updates: Database['public']['Tables']['reports']['Update'] = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.hasDailyExpenses !== undefined) {
      updates.has_daily_expenses = input.hasDailyExpenses;
      if (input.hasDailyExpenses) {
        if (input.dailyBudget !== undefined)
          updates.daily_budget =
            input.dailyBudget != null ? String(input.dailyBudget) : null;
        if (input.periodStart !== undefined) updates.period_start = input.periodStart;
        if (input.periodEnd !== undefined) updates.period_end = input.periodEnd;
      } else {
        updates.daily_budget = null;
        updates.period_start = null;
        updates.period_end = null;
      }
    }
    return supabase.from('reports').update(trimStrings(updates)).eq('id', id).select().single();
  }

  async removeReport(id: string) {
    return supabase.from('reports').delete().eq('id', id);
  }
}

export const reportsService = new ReportsService();