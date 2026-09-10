import { ApiError, api } from '@/shared/api/http';
import type { Report } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/**
 * GET /reports/:id: сервер отвечает 404 на чужой или удалённый отчёт,
 * поэтому 404 здесь превращается в null (страница покажет «не найден»).
 */
export const useReport = (id: string) =>
  useQuery<Report | null>({
    queryKey: ['reports', id],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      try {
        return (await api.get<Report>(`/reports/${id}`)) ?? null;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  });
