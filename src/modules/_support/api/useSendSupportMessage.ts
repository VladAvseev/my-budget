import { supabase } from '@/shared/supabase/supabase';
import { trimStrings } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supportChatQueryKey } from './useSupportChat';
import { supportUnreadQueryKey } from './useSupportUnread';

export const useSendSupportMessage = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['supportSendMessage', userId],
    mutationFn: async (text: string) => {
      const { error } = await supabase.rpc('send_support_message', {
        p_text: trimStrings(text),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportChatQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: supportUnreadQueryKey(userId) });
    },
  });
};