import { api } from '@/shared/api/http';
import type { Operation } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

export type UseGoalPeriodOperationsResponse = Operation[];
export interface UseGoalPeriodOperationsRequest {
  reportId: string;
}

export const useGoalPeriodOperations = ({ reportId }: UseGoalPeriodOperationsRequest) =>
  useQuery({
    
    queryKey: ['reports', reportId, 'operations', 'goal-period'],
    enabled: Boolean(reportId),
    queryFn: ({ signal }) =>
      api.get<UseGoalPeriodOperationsResponse>(`/operations?reportId=${reportId}&type=income,expense,transfer`, { signal }),
  });
