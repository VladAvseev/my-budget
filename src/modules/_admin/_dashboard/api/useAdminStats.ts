import { supabase } from '@/shared/supabase/supabase';
import type { AdminDashboardStats } from '@/shared/supabase/types/database.types';
import { useQuery } from '@tanstack/react-query';

export const useAdminStats = () =>
  useQuery<AdminDashboardStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_dashboard_stats');
      if (error) throw error;
      return data;
    },
    refetchInterval: 60_000,
  });
