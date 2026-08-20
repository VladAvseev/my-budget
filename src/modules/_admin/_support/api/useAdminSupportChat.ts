import { supabase } from '@/shared/supabase/supabase';
import type { SupportMessage } from '@/shared/supabase/types/domain';
import { useQuery } from '@tanstack/react-query';

export interface AdminSupportChatData {
  messages: SupportMessage[];
  isOpen: boolean;
}

export const adminSupportChatQueryKey = (userId: string) =>
  ['admin', 'support', 'chat', userId] as const;

export const useAdminSupportChat = (userId: string) =>
  useQuery<AdminSupportChatData | null>({
    queryKey: adminSupportChatQueryKey(userId),
    enabled: Boolean(userId),
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_support_chat', { p_user_id: userId });
      if (error) throw error;
      return data;
    },
  });