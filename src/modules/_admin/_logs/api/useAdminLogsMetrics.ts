import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

/** Период агрегации метрик (query `period`). */
export type AdminLogsPeriod = '24h' | '7d' | '30d' | 'all';

/** Статистика по эндпоинту (топ медленных / топоых ошибок). */
export interface AdminLogEndpointStat {
  endpoint: string;
  count: number;
  avgDurationMs: number;
  errorCount: number;
}

/**
 * Ответ GET /admin/logs/metrics (агрегаты по request_logs). Счётчики разбиты
 * по классам статуса: info (<400), warning (4xx), error (только 5xx).
 * Топ-листы — по 10 позиций.
 */
export interface AdminLogsMetrics {
  period: AdminLogsPeriod;
  total: number;
  infoCount: number;
  warningCount: number;
  errorCount: number;
  /** доля ошибок (только 5xx) 0..1, null — запросов за период не было */
  errorRate: number | null;
  avgDurationMs: number | null;
  p95DurationMs: number | null;
  topSlowestEndpoints: AdminLogEndpointStat[];
  topErrorEndpoints: AdminLogEndpointStat[];
}

/** Параметры GET /admin/logs/metrics. */
export type UseAdminLogsMetricsRequest = AdminLogsPeriod;

/** Ответ GET /admin/logs/metrics. */
export type UseAdminLogsMetricsResponse = AdminLogsMetrics;

/** GET /admin/logs/metrics: агрегаты по request_logs за выбранный период. */
export const useAdminLogsMetrics = (period: UseAdminLogsMetricsRequest) =>
  useQuery<UseAdminLogsMetricsResponse>({
    queryKey: ['admin', 'logs', 'metrics', period],
    queryFn: ({ signal }) =>
      api.get<UseAdminLogsMetricsResponse>(`/admin/logs/metrics?period=${period}`, { signal }),
    staleTime: 5 * 60_000,
  });
