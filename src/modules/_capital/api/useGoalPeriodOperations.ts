import { api } from '@/shared/api/http';
import type { Operation } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

export type UseGoalPeriodOperationsResponse = Operation[];
export interface UseGoalPeriodOperationsRequest {
  month: string;
}

export const useGoalPeriodOperations = ({ month }: UseGoalPeriodOperationsRequest) =>
  useQuery({
    queryKey: ['operations', month, 'goal-period'],
    enabled: Boolean(month),
    queryFn: ({ signal }) =>
      api.get<UseGoalPeriodOperationsResponse>(
        `/operations?months=${month}&type=income,expense,transfer`,
        { signal },
      ),
  });
