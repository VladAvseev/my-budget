import { supabase } from '@/shared/supabase/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSupportChatsQueryKey } from './useAdminSupportChats';
import { adminSupportOpenCountQueryKey } from './useAdminSupportOpenCount';

export const useAdminClearChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['adminSupportClearChat'],
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('admin_clear_support_chat', { p_user_id: userId });
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminSupportChatsQueryKey });
      queryClient.invalidateQueries({ queryKey: adminSupportOpenCountQueryKey });
    },
  });
};