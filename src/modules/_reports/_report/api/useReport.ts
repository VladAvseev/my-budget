import { ApiError, api } from '@/shared/api/http';
import type { Report } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/**
 * GET /reports/:id: сервер отвечает 404 на чужой или удалённый отчёт,
 * поэтому 404 здесь превращается в null (страница покажет «не найден»).
 */

/** Запрос — id отчёта из пути. */
export type UseReportRequest = string;

/** Данные хука: отчёт или null, если он удалён/чужой. */
export type UseReportResponse = Report | null;

export const useReport = (id: UseReportRequest) =>
  useQuery<UseReportResponse>({
    queryKey: ['reports', id],
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      try {
        return (await api.get<Report>(`/reports/${id}`, { signal })) ?? null;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  });
