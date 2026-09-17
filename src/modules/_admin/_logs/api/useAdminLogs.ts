import { api } from '@/shared/api/http';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export type AdminLogsStatusFilter = 'all' | 'info' | 'warning' | 'error';

export type AdminLogsSortField = 'date' | 'duration';
export type AdminLogsSortOrder = 'asc' | 'desc';

export interface AdminLogRow {
  id: number;
  createdAt: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;

  error: string | null;

  userId: string | null;

  userLogin: string | null;

  isAuthenticated: boolean;
}

export interface AdminLogsPage {
  items: AdminLogRow[];
  total: number;
  page: number;
  limit: number;
}

const LIMIT = 50;

export interface UseAdminLogsRequest {
  status: AdminLogsStatusFilter;

  userId: string;

  methods: string[];
  page: number;
  sort: AdminLogsSortField;
  order: AdminLogsSortOrder;
}

export type UseAdminLogsResponse = AdminLogsPage;

export const useAdminLogs = ({ status, userId, methods, page, sort, order }: UseAdminLogsRequest) =>
  useQuery<UseAdminLogsResponse>({
    queryKey: ['admin', 'logs', { status, userId, methods, page, sort, order }],
    queryFn: ({ signal }) =>
      api.get<UseAdminLogsResponse>(
        `/admin/logs?status=${status}&page=${page}&limit=${LIMIT}&sort=${sort}&order=${order}${
          userId ? `&userId=${encodeURIComponent(userId)}` : ''
        }${methods.length > 0 ? `&methods=${encodeURIComponent(methods.join(','))}` : ''}`,
        { signal },
      ),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });

export const ADMIN_LOGS_LIMIT = LIMIT;
