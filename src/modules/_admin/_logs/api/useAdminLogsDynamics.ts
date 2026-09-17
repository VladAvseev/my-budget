import { api } from '@/shared/api/http';
import type {
  AdminAudience,
  AdminChartMetric,
  AdminChartPoint,
  AdminLogsBucket,
} from '@/shared/api/types/admin';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export interface AdminLogsDynamics {
  audience: AdminAudience;
  metric: AdminChartMetric;
  bucket: AdminLogsBucket;
  points: AdminChartPoint[];
  total: number;
}

export interface UseAdminLogsDynamicsRequest {
  audience: AdminAudience;
  metric: AdminChartMetric;
  bucket: AdminLogsBucket;
}

export type UseAdminLogsDynamicsResponse = AdminLogsDynamics;

export const useAdminLogsDynamics = ({ audience, metric, bucket }: UseAdminLogsDynamicsRequest) =>
  useQuery<UseAdminLogsDynamicsResponse>({
    queryKey: ['admin', 'logs', 'dynamics', audience, metric, bucket],
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    queryFn: ({ signal }) =>
      api.get<UseAdminLogsDynamicsResponse>(
        `/admin/logs/dynamics?${new URLSearchParams({ audience, metric, bucket })}`,
        { signal },
      ),
  });
