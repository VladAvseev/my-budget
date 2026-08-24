import { supabase } from '@/shared/supabase/supabase';
import type { NewsRow } from '@/shared/supabase/types/domain';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useAdminNewsList = () =>
  useQuery<NewsRow[]>({
    queryKey: ['admin', 'news'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_news_list');
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 60_000,
  });

export const useCreateNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (text: string) => {
      const { error } = await supabase.rpc('admin_create_news', { p_text: text });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'news'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
};

export const useEditNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, text }: { id: number; text: string }) => {
      const { error } = await supabase.rpc('admin_update_news', {
        p_id: id,
        p_text: text,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'news'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
};

export const useDeleteNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.rpc('admin_delete_news', { p_id: id });
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
