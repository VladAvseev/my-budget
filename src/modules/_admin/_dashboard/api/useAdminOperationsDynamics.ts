import { supabase } from '@/shared/supabase/supabase';
import { useQuery } from '@tanstack/react-query';

export const useAdminOperationsDynamics = () =>
  useQuery<{ created_at: string }[]>({
    queryKey: ['admin', 'operationsDynamics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_operations_dynamics');
      if (error) throw error;
      return (data as { created_at: string }[]) ?? [];
    },
    refetchInterval: 60_000,
  });
