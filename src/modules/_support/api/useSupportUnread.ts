import { supportService } from '@/shared/supabase/services/support';
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
      const chat = await supportService.getChatRow(userId);
      return supportService.getUnreadCount(userId, chat?.user_read_at ?? null);
    },
  });