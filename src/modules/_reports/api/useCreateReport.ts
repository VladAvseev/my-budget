import { invalidateHomeCaches } from '@/shared/api/hooks';
import { api } from '@/shared/api/http';
import type { Report } from '@/shared/api/types/domain';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { useMutation, useQueryClient } from '@tanstack/react-query';


const createReportMutationKey = ['createReport'] as const;


export interface UseCreateReportRequest {
  name: string;
  code?: string;
  periodStart: string;
  periodEnd: string;
}


export type UseCreateReportResponse = Report;


interface CreateReportBody {
  name: string;
  code: string;
  periodStart: string;
  periodEnd: string;
}

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createReportMutationKey,
    mutationFn: async (input: UseCreateReportRequest) => {
      const body: CreateReportBody = {
        name: input.name.trim(),
        code: input.code ?? '',
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
      };
      return api.post<UseCreateReportResponse>('/reports', body);
    },
    onMutate: async (input) => {
      const key = ['reports'];
      const previous = queryClient.getQueryData<Report[]>(key) ?? [];

      const now = new Date().toISOString();
      const optimistic: Report & OptimisticItem = {
        id: createOptimisticId(),
        user_id: '',
        name: input.name,
        code: input.code ?? '',
        period_start: input.periodStart,
        period_end: input.periodEnd,
        created_at: now,
        updated_at: now,
        _optimistic: true,
      };

      queryClient.setQueryData(key, [optimistic, ...previous]);

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(['reports'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['onboardingCounts'] });
      invalidateHomeCaches(queryClient);
    },
  });
};
