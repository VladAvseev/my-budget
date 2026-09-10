import { api } from '@/shared/api/http';
import type { Report } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /reports — список периодов для графиков накоплений. */
export const useReports = () =>
  useQuery<Report[]>({
    queryKey: ['reports'],
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => (await api.get<Report[]>('/reports', { signal })) ?? [],
  });
