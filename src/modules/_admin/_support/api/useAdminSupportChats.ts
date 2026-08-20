import { supabase } from '@/shared/supabase/supabase';
import type { AdminSupportChat } from '@/shared/supabase/types/domain';
import { useQuery } from '@tanstack/react-query';

export const adminSupportChatsQueryKey = ['admin', 'support', 'chats'] as const;

export const useAdminSupportChats = () =>
  useQuery<AdminSupportChat[]>({
    queryKey: adminSupportChatsQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_support_chats');
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 60_000,
  });