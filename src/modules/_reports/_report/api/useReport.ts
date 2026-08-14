import { reportsService, type Report } from '@/shared/supabase/services/reports';
import { useQuery } from '@tanstack/react-query';

export const useReport = (id: string) =>
  useQuery<Report | null>({
    queryKey: ['reports', id],
    queryFn: async () => {
      const { data, error } = await reportsService.getReport(id);
      if (error) throw error;
      return data ?? null;
    },
  });