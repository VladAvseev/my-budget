import { api } from '@/shared/api/http';
import type {
  AdminAudience,
  AdminChartMetric,
  AdminChartPoint,
  AdminLogsBucket,
} from '@/shared/api/types/admin';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

/** Ответ GET /admin/logs/dynamics. */
export interface AdminLogsDynamics {
  audience: AdminAudience;
  metric: AdminChartMetric;
  bucket: AdminLogsBucket;
  points: AdminChartPoint[];
  total: number;
}

/** Параметры GET /admin/logs/dynamics. */
export interface UseAdminLogsDynamicsRequest {
  audience: AdminAudience;
  metric: AdminChartMetric;
  bucket: AdminLogsBucket;
}

/** Ответ GET /admin/logs/dynamics. */
export type UseAdminLogsDynamicsResponse = AdminLogsDynamics;

/**
 * GET /admin/logs/dynamics?audience=&metric=&bucket=: непустые МСК-часы/сутки
 * количества логов или уникальных авторов. Сервер считает выбранную метрику на
 * выбранном бакете, поэтому уникальных пользователей нельзя агрегировать из
 * часов на клиенте.
 *
 * Ряд не усекается: он ограничен ретенцией логов (по умолчанию 30 суток, т.е.
 * ≤720 час-бакетов), так что усечение только скрыло бы часть окна. При смене
 * фильтров keepPreviousData оставляет прошлый график (карточка приглушает его
 * через isPlaceholderData).
 */
export const useAdminLogsDynamics = ({
  audience,
  metric,
  bucket,
}: UseAdminLogsDynamicsRequest) =>
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
