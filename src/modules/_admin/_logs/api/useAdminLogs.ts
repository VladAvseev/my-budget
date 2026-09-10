import { api } from '@/shared/api/http';
import type {
  AdminLogsPage,
  AdminLogsSortField,
  AdminLogsSortOrder,
  AdminLogsStatusFilter,
} from '@/shared/api/types/domain';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

interface UseAdminLogsParams {
  status: AdminLogsStatusFilter;
  /** '' — все авторы, 'anonymous' — без авторизации, иначе uuid пользователя. */
  userId: string;
  page: number;
  sort: AdminLogsSortField;
  order: AdminLogsSortOrder;
}

const LIMIT = 50;

/** GET /admin/logs: страница логов запросов с фильтром, сортировкой и пагинацией. */
export const useAdminLogs = ({ status, userId, page, sort, order }: UseAdminLogsParams) =>
  useQuery<AdminLogsPage>({
    queryKey: ['admin', 'logs', { status, userId, page, sort, order }],
    queryFn: ({ signal }) =>
      api.get<AdminLogsPage>(
        `/admin/logs?status=${status}&page=${page}&limit=${LIMIT}&sort=${sort}&order=${order}${
          userId ? `&userId=${encodeURIComponent(userId)}` : ''
        }`,
        { signal },
      ),
    placeholderData: keepPreviousData,
  });

export const ADMIN_LOGS_LIMIT = LIMIT;
