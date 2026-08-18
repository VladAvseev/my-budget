import { supportService } from '@/shared/supabase/services/support';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supportChatQueryKey } from './useSupportChat';
import { supportUnreadQueryKey } from './useSupportUnread';

export const useSendSupportMessage = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['supportSendMessage', userId],
    mutationFn: (text: string) => supportService.sendMessage(userId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportChatQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: supportUnreadQueryKey(userId) });
    },
  });
};