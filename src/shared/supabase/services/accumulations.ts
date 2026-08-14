import { supabase } from '../supabase';
import type { Database } from '../types/database.types';
import { trimStrings } from '@/shared/utils';

export type Accumulation = Database['public']['Tables']['accumulations']['Row'];
type AccumulationInsert = Database['public']['Tables']['accumulations']['Insert'];

export interface AccumulationInput {
  amount: number;
  description: string;
  categoryId?: string | null;
}

export type AccumulationUpdateInput = Partial<AccumulationInput>;

class AccumulationsService {
  async listAccumulations(userId: string) {
    return supabase
      .from('accumulations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }

  async getAccumulation(id: string) {
    return supabase.from('accumulations').select('*').eq('id', id).maybeSingle();
  }

  async createAccumulation(userId: string, input: AccumulationInput) {
    const insert: AccumulationInsert = {
      user_id: userId,
      description: input.description,
      amount: String(input.amount),
    };
    if (input.categoryId !== undefined) insert.category_id = input.categoryId;
    return supabase.from('accumulations').insert(trimStrings(insert)).select().single();
  }

  async updateAccumulation(id: string, input: AccumulationUpdateInput) {
    const updates: Database['public']['Tables']['accumulations']['Update'] = {};
    if (input.amount !== undefined) updates.amount = String(input.amount);
    if (input.description !== undefined) updates.description = input.description;
    if (input.categoryId !== undefined) updates.category_id = input.categoryId;
    return supabase.from('accumulations').update(trimStrings(updates)).eq('id', id).select().single();
  }

  async removeAccumulation(id: string) {
    return supabase.from('accumulations').delete().eq('id', id);
  }
}

export const accumulationsService = new AccumulationsService();