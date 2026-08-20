import { supabase } from '@/shared/supabase/supabase';
import type { Report } from '@/shared/supabase/types/domain';
import { useQuery } from '@tanstack/react-query';

export const useReport = (id: string) =>
  useQuery<Report | null>({
    queryKey: ['reports', id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_report', { p_report_id: id });
      if (error) throw error;
      return (data as Report) ?? null;
    },
  });