import { supabase } from '@/shared/supabase/supabase';
import type { NewsRow } from '@/shared/supabase/types/database.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useAdminNews = () =>
  useQuery<NewsRow | null>({
    queryKey: ['admin', 'news'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_news');
      if (error) throw error;
      return data ?? null;
    },
    refetchInterval: 60_000,
  });

export const useUpdateNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (text: string) => {
      const { error } = await supabase.rpc('admin_update_news', { p_text: text });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'news'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
};

export const useSetShowNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (show: boolean) => {
      const { error } = await supabase.rpc('admin_set_show_news', { p_show: show });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'news'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};
