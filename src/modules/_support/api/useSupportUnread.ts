import { supabase } from '@/shared/supabase/supabase';
import { useQuery } from '@tanstack/react-query';

export const supportUnreadQueryKey = (userId: string) => ['support', 'unread', userId] as const;

export const useSupportUnread = (userId: string) =>
  useQuery<number>({
    queryKey: supportUnreadQueryKey(userId),
    enabled: Boolean(userId),
    retry: false,
    refetchInterval: 60_000,
    queryFn: async () => {
      if (!userId) return 0;
      const { data, error } = await supabase.rpc('get_support_unread_count', {
        p_user_id: userId,
      });
      if (error) throw error;
      return (data as number) ?? 0;
    },
  });