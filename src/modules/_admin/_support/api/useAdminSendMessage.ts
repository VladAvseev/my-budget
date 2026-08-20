import { supabase } from '@/shared/supabase/supabase';
import type { SupportMessage } from '@/shared/supabase/types/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSupportChatQueryKey } from './useAdminSupportChat';
import { adminSupportChatsQueryKey } from './useAdminSupportChats';

export const useAdminSendMessage = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['adminSupportSendMessage', userId],
    mutationFn: async (text: string) => {
      const { data, error } = await supabase.rpc('admin_send_support_message', {
        p_user_id: userId,
        p_text: text,
      });
      if (error) throw error;
      return data as SupportMessage;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminSupportChatQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: adminSupportChatsQueryKey });
    },
  });
};