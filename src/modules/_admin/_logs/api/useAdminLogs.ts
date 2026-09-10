import { api } from '@/shared/api/http';
import type { AdminLogsPage, AdminLogsStatusFilter } from '@/shared/api/types/domain';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

interface UseAdminLogsParams {
  status: AdminLogsStatusFilter;
  /** '' — все авторы, 'anonymous' — без авторизации, иначе uuid пользователя. */
  userId: string;
  page: number;
}

const LIMIT = 50;

/** GET /admin/logs: страница логов запросов с фильтром и пагинацией. */
export const useAdminLogs = ({ status, userId, page }: UseAdminLogsParams) =>
  useQuery<AdminLogsPage>({
    queryKey: ['admin', 'logs', { status, userId, page }],
    queryFn: () =>
      api.get<AdminLogsPage>(
        `/admin/logs?status=${status}&page=${page}&limit=${LIMIT}${
          userId ? `&userId=${encodeURIComponent(userId)}` : ''
        }`,
      ),
    placeholderData: keepPreviousData,
  });

export const ADMIN_LOGS_LIMIT = LIMIT;
