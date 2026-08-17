import { supabase } from '../supabase';
import type { Database } from '../types/database.types';

export type NewsRow = Database['public']['Tables']['news']['Row'];

class NewsService {
  async getNews() {
    return supabase
      .from('news')
      .select('id, text')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();
  }
}

export const newsService = new NewsService();
