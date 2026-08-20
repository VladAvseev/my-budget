import { supabase } from '@/shared/supabase/supabase';
import type { AdminUserRow } from '@/shared/supabase/types/domain';
import { useQuery } from '@tanstack/react-query';

export const useAdminUsers = () =>
  useQuery<AdminUserRow[]>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_users');
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 60_000,
  });
