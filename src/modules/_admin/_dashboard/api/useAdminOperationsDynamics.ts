import { api } from '@/shared/api/http';
import type {
  AdminAudience,
  AdminChartMetric,
  AdminChartPoint,
  AdminOperationsAggregation,
} from '@/shared/api/types/admin';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

/**
 * GET /admin/dashboard/operations-dynamics?audience=&metric=&aggregation=:
 * сервер группирует операции по МСК-периодам и считает выбранную метрику.
 * audience: 'all' — все операции, 'users' — только пользователей (без админов).
 * metric: 'count' — количество операций, 'unique_users' — уникальные авторы.
 *
 * Сервер отдаёт ВСЮ серию бакетов без усечения (сутки-ряд растёт ~365 точек/год,
 * payload остаётся крошечным), поэтому накопленный итог «Всего» сходится с
 * total по всей таблице. При смене фильтров keepPreviousData оставляет прошлый
 * график до прихода нового (карточка приглушает его через isPlaceholderData).
 */

/** Ответ GET /admin/dashboard/operations-dynamics. */
export interface AdminOperationsDynamics {
  audience: AdminAudience;
  metric: AdminChartMetric;
  aggregation: AdminOperationsAggregation;
  points: AdminChartPoint[];
  total: number;
}

/** Параметры GET /admin/dashboard/operations-dynamics. */
export interface UseAdminOperationsDynamicsRequest {
  audience: AdminAudience;
  metric: AdminChartMetric;
  aggregation: AdminOperationsAggregation;
}

/** Ответ GET /admin/dashboard/operations-dynamics. */
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
