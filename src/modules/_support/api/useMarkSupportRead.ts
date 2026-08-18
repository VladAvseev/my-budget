import { supportService } from '@/shared/supabase/services/support';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supportChatQueryKey } from './useSupportChat';
import { supportUnreadQueryKey } from './useSupportUnread';

export const useMarkSupportRead = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['supportMarkRead', userId],
    mutationFn: () => supportService.markRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportChatQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: supportUnreadQueryKey(userId) });
    },
  });
};