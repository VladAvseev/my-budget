import { invalidateHomeCaches } from '@/shared/api/hooks';
import { api } from '@/shared/api/http';
import type { Report } from '@/shared/api/types/domain';
import { trimStrings } from '@/shared/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';




export interface UseUpdateReportRequest {
  name?: string;
  periodStart?: string;
  periodEnd?: string;
}


export type UseUpdateReportResponse = Report;


interface UpdateReportBody {
  name?: string;
  periodStart?: string;
  periodEnd?: string;
}

export const useUpdateReport = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UseUpdateReportRequest) => {
      const body: UpdateReportBody = {};
      if (input.name !== undefined) body.name = trimStrings(input.name);
      if (input.periodStart !== undefined) body.periodStart = input.periodStart;
      if (input.periodEnd !== undefined) body.periodEnd = input.periodEnd;
      return api.patch<UseUpdateReportResponse>(`/reports/${id}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['userSummary'] });
      queryClient.invalidateQueries({ queryKey: ['overview', 'category-summary'] });
      invalidateHomeCaches(queryClient);
    },
  });
};
