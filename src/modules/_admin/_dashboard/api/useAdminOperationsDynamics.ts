import { supabase } from '@/shared/supabase/supabase';
import { useQuery } from '@tanstack/react-query';
import type { DynamicsDailyRow } from '../utils/buildOperationsDynamicsData';

export const useAdminOperationsDynamics = () =>
  useQuery<DynamicsDailyRow[]>({
    queryKey: ['admin', 'operationsDynamics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_operations_dynamics');
      if (error) throw error;
      return (data as DynamicsDailyRow[]) ?? [];
    },
    refetchInterval: 60_000,
  });
