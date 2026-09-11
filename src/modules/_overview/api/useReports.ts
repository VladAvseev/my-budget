import { api } from '@/shared/api/http';
import type { Report } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /reports. */
export type UseReportsResponse = Report[];

export const useReports = () =>
  useQuery<UseReportsResponse>({
    queryKey: ['reports'],
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseReportsResponse>('/reports', { signal })) ?? [],
  });
