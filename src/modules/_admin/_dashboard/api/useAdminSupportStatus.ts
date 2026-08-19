import { supabase } from '@/shared/supabase/supabase';
import type { AdminSupportStatus } from '@/shared/supabase/types/database.types';
import { useQuery } from '@tanstack/react-query';

export const useAdminSupportStatus = () =>
  useQuery<AdminSupportStatus>({
    queryKey: ['admin', 'supportStatus'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_support_status');
      if (error) throw error;
      return data;
    },
    refetchInterval: 60_000,
  });