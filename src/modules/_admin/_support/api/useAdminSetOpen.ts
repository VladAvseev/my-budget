import { supabase } from '@/shared/supabase/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSupportChatQueryKey } from './useAdminSupportChat';
import { adminSupportChatsQueryKey } from './useAdminSupportChats';
import { adminSupportOpenCountQueryKey } from './useAdminSupportOpenCount';

export const useAdminSetOpen = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['adminSupportSetOpen', userId],
    mutationFn: async (open: boolean) => {
      const { error } = await supabase.rpc('admin_set_support_open', {
        p_user_id: userId,
        p_open: open,
      });
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminSupportChatQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: adminSupportChatsQueryKey });
      queryClient.invalidateQueries({ queryKey: adminSupportOpenCountQueryKey });
    },
  });
};