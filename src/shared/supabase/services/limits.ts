import { supabase } from '../supabase';
import type { Database } from '../types/database.types';
import { trimStrings } from '@/shared/utils';

export type CategoryLimit = Database['public']['Tables']['category_limits']['Row'];
type CategoryLimitInsert = Database['public']['Tables']['category_limits']['Insert'];

export interface CategoryLimitInput {
  reportId: string;
  categoryId: string;
  amount: number;
}

class CategoryLimitsService {
  async listByReport(reportId: string) {
    return supabase
      .from('category_limits')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });
  }

  async replaceLimits(reportId: string, userId: string, limits: CategoryLimitInput[]) {
    const { error: deleteError } = await supabase
      .from('category_limits')
      .delete()
      .eq('report_id', reportId);
    if (deleteError) return { data: null, error: deleteError };

    if (limits.length === 0) {
      return { data: [], error: null };
    }

    const rows: CategoryLimitInsert[] = limits.map((limit) => ({
      report_id: reportId,
      category_id: limit.categoryId,
      user_id: userId,
      amount: String(limit.amount),
    }));

    return supabase.from('category_limits').insert(trimStrings(rows)).select();
  }
}

export const categoryLimitsService = new CategoryLimitsService();
