import { supabase } from '@/shared/supabase/supabase';
import type { Report } from '@/shared/supabase/types/domain';
import { useQuery } from '@tanstack/react-query';

export const useReports = () =>
  useQuery<Report[]>({
    queryKey: ['reports'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_reports');
      if (error) throw error;
      return (data as Report[]) ?? [];
    },
  });
