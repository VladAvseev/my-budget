import { supabase } from '@/shared/supabase/supabase';
import type { SupportChatData } from '@/shared/supabase/types/domain';
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
      const { data, error } = await supabase.rpc('get_support_chat', { p_user_id: userId });
      if (error) throw error;
      return (
        (data as SupportChatData) ?? {
          messages: [],
          isOpen: false,
          userReadAt: null,
          unreadCount: 0,
          chatExists: false,
        }
      );
    },
  });