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

/** Точка ряда метрик по интервалам. */
export interface AdminLogsSeriesPoint {
  /** ISO-строка начала интервала (час для периода 24h, иначе день). */
  point: string;
  total: number;
  errors: number;
}

/** Ответ GET /admin/logs/metrics (агрегаты по request_logs). */
export interface AdminLogsMetrics {
  period: AdminLogsPeriod;
  total: number;
  successCount: number;
  errorCount: number;
  /** доля ошибок 0..1, null — запросов за период не было */
  errorRate: number | null;
  avgDurationMs: number | null;
  p95DurationMs: number | null;
  topSlowestEndpoints: AdminLogEndpointStat[];
  topErrorEndpoints: AdminLogEndpointStat[];
  perPoint: AdminLogsSeriesPoint[];
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
