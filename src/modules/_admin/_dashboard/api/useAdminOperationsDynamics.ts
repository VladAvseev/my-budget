import { api } from '@/shared/api/http';
import type {
  AdminAudience,
  AdminChartMetric,
  AdminChartPoint,
  AdminOperationsAggregation,
} from '@/shared/api/types/admin';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export interface AdminOperationsDynamics {
  audience: AdminAudience;
  metric: AdminChartMetric;
  aggregation: AdminOperationsAggregation;
  points: AdminChartPoint[];
  total: number;
}

export interface UseAdminOperationsDynamicsRequest {
  audience: AdminAudience;
  metric: AdminChartMetric;
  aggregation: AdminOperationsAggregation;
}

export type UseAdminOperationsDynamicsResponse = AdminOperationsDynamics;

export const useAdminOperationsDynamics = ({
  audience,
  metric,
  aggregation,
}: UseAdminOperationsDynamicsRequest) =>
  useQuery<UseAdminOperationsDynamicsResponse>({
    queryKey: ['admin', 'operationsDynamics', audience, metric, aggregation],
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    queryFn: async ({ signal }) =>
      (await api.get<UseAdminOperationsDynamicsResponse>(
        `/admin/dashboard/operations-dynamics?${new URLSearchParams({
          audience,
          metric,
          aggregation,
        })}`,
        { signal },
      )) ?? { audience, metric, aggregation, points: [], total: 0 },
  });
