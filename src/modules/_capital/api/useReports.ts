import { api } from '@/shared/api/http';
import type { Report } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /reports — список периодов для графиков накоплений. */
export const reportsQueryKey = (userId: string) => ['reports', userId] as const;

/** Ответ GET /reports. */
export type UseReportsResponse = Report[];

export const useReports = (userId: string) =>
  useQuery<UseReportsResponse>({
    queryKey: reportsQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseReportsResponse>('/reports', { signal })) ?? [],
  });
