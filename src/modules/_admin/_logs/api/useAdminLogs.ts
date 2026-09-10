import { api } from '@/shared/api/http';
import type { AdminLogsPage, AdminLogsStatusFilter } from '@/shared/api/types/domain';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

interface UseAdminLogsParams {
  status: AdminLogsStatusFilter;
  page: number;
}

const LIMIT = 50;

/** GET /admin/logs: страница логов запросов с фильтром и пагинацией. */
export const useAdminLogs = ({ status, page }: UseAdminLogsParams) =>
  useQuery<AdminLogsPage>({
    queryKey: ['admin', 'logs', { status, page }],
    queryFn: () => api.get<AdminLogsPage>(`/admin/logs?status=${status}&page=${page}&limit=${LIMIT}`),
    placeholderData: keepPreviousData,
  });

export const ADMIN_LOGS_LIMIT = LIMIT;
