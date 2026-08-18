import { supabase } from '@/shared/supabase/supabase';
import { useQuery } from '@tanstack/react-query';

export const adminSupportOpenCountQueryKey = ['admin', 'support', 'openCount'] as const;

export const useAdminSupportOpenCount = () =>
  useQuery<number>({
    queryKey: adminSupportOpenCountQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_support_open_count');
      if (error) throw error;
      return (data as number) ?? 0;
    },
    refetchInterval: 60_000,
  });