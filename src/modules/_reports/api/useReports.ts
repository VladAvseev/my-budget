import { reportsService, type Report } from '@/shared/supabase/services/reports';
import { useQuery } from '@tanstack/react-query';

export const useReports = () =>
  useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await reportsService.listReports();
      if (error) throw error;
      return data ?? [];
    },
  });