import { supabase } from '@/shared/supabase/supabase';
import type { OperationSummary } from '@/shared/supabase/types/domain';
import { summaryQueryKey } from './keys';
import { useQuery } from '@tanstack/react-query';

export const useSummary = (reportId: string) =>
  useQuery<OperationSummary>({
    queryKey: summaryQueryKey(reportId),
    enabled: Boolean(reportId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_report_summary', {
        p_report_id: reportId,
      });
      if (error) throw error;
      return (data as OperationSummary) ?? { income: 0, expense: 0, savings: 0, daily: 0 };
    },
    placeholderData: { income: 0, expense: 0, savings: 0, daily: 0 },
  });