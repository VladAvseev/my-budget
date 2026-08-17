import { newsService, type NewsRow } from '@/shared/supabase/services/news';
import { useQuery } from '@tanstack/react-query';

export const useNews = () =>
  useQuery<NewsRow | null>({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await newsService.getNews();
      if (error) throw error;
      return data ?? null;
    },
  });
