import { api } from '@/shared/api/http';
import type { Report } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /reports: свои периоды, новые по периоду сверху. */
export const useReports = () =>
  useQuery<Report[]>({
    queryKey: ['reports'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => (await api.get<Report[]>('/reports')) ?? [],
  });
