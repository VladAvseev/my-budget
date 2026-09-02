import { supabase } from '@/shared/supabase/supabase';
import type { NewsRow } from '@/shared/supabase/types/domain';
import { useQuery } from '@tanstack/react-query';

export const useNews = () =>
  useQuery<NewsRow[]>({
    queryKey: ['news'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_latest_news');
      if (error) throw error;
      return data ?? [];
    },
  });
