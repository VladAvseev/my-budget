import { supabase } from '@/shared/supabase/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supportChatQueryKey } from './useSupportChat';
import { supportUnreadQueryKey } from './useSupportUnread';

export const useMarkSupportRead = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['supportMarkRead', userId],
    mutationFn: async () => {
      const { error } = await supabase.rpc('mark_support_read');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportChatQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: supportUnreadQueryKey(userId) });
    },
  });
};