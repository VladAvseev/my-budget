import { supabase } from '../supabase';
import type { Database } from '../types/database.types';
import { trimStrings } from '@/shared/utils';

export type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

export type CategoryType = 'expense' | 'income' | 'savings';

export interface CategoryCreateInput {
  type: CategoryType;
  name: string;
  color?: string | null;
}

export interface CategoryUpdateInput {
  name?: string;
  color?: string | null;
}

class CategoriesService {
  async listCategories(userId: string, type?: CategoryType) {
    let query = supabase.from('categories').select('*').eq('user_id', userId);
    if (type) {
      query = query.eq('type', type);
    }
    return query.order('created_at', { ascending: true });
  }

  async countCategories(userId: string) {
    return supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
  }

  async getCategory(id: string) {
    return supabase.from('categories').select('*').eq('id', id).maybeSingle();
  }

  async createCategory(userId: string, input: CategoryCreateInput) {
    const insert: CategoryInsert = { user_id: userId, type: input.type, name: input.name };
    if (input.color !== undefined) insert.color = input.color;
    return supabase.from('categories').insert(trimStrings(insert)).select().single();
  }

  async updateCategory(id: string, input: CategoryUpdateInput) {
    const updates: Database['public']['Tables']['categories']['Update'] = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.color !== undefined) updates.color = input.color;
    return supabase.from('categories').update(trimStrings(updates)).eq('id', id).select().single();
  }

  async removeCategory(id: string) {
    return supabase.from('categories').delete().eq('id', id);
  }
}

export const categoriesService = new CategoriesService();