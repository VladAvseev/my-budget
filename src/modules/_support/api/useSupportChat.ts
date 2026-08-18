import { supportService, type SupportChatData } from '@/shared/supabase/services/support';
import { useQuery } from '@tanstack/react-query';

export const supportChatQueryKey = (userId: string) => ['support', 'chat', userId] as const;

export const useSupportChat = (userId: string) =>
  useQuery<SupportChatData>({
    queryKey: supportChatQueryKey(userId),
    enabled: Boolean(userId),
    refetchInterval: 60_000,
    queryFn: async () => {
      if (!userId) {
        return { messages: [], isOpen: false, userReadAt: null, unreadCount: 0, chatExists: false };
      }
      return supportService.getChat(userId);
    },
  });