import { api } from '@/shared/api/http';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

/** Статус-фильтр списка: все / только успешные (<400) / только с ошибкой (≥400). */
export type AdminLogsStatusFilter = 'all' | 'success' | 'error';

/** Поле и порядок сортировки строк логов (query sort/order в GET /admin/logs). */
export type AdminLogsSortField = 'date' | 'duration';
export type AdminLogsSortOrder = 'asc' | 'desc';

/**
 * Одна строка лога: сервер хранит только метод, путь, статус, длительность,
 * автора, ip и текст ошибки (для ответов с статусом >= 400).
 */
export interface AdminLogRow {
  id: number;
  createdAt: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  /** Сообщение об ошибке; null — запрос успешный, раскрытие строки не нужно. */
  error: string | null;
  /** Автор запроса; null — запрос без авторизации (или пользователь удалён). */
  userId: string | null;
  /** Email автора (для отображения в таблице логов). */
  userEmail: string | null;
  /** true — на момент запроса был валидный access-токен. */
  isAuthenticated: boolean;
  ip: string | null;
}

/** Страница логов (ответ GET /admin/logs). */
export interface AdminLogsPage {
  items: AdminLogRow[];
  total: number;
  page: number;
  limit: number;
}

const LIMIT = 50;

/** Параметры GET /admin/logs (фильтр, сортировка, пагинация). */
export interface UseAdminLogsRequest {
  status: AdminLogsStatusFilter;
  /** '' — все авторы, 'anonymous' — без авторизации, иначе uuid пользователя. */
  userId: string;
  page: number;
  sort: AdminLogsSortField;
  order: AdminLogsSortOrder;
}

/** Ответ GET /admin/logs. */
export type UseAdminLogsResponse = AdminLogsPage;

/** GET /admin/logs: страница логов запросов с фильтром, сортировкой и пагинацией. */
export const useAdminLogs = ({ status, userId, page, sort, order }: UseAdminLogsRequest) =>
  useQuery<UseAdminLogsResponse>({
    queryKey: ['admin', 'logs', { status, userId, page, sort, order }],
    queryFn: ({ signal }) =>
      api.get<UseAdminLogsResponse>(
        `/admin/logs?status=${status}&page=${page}&limit=${LIMIT}&sort=${sort}&order=${order}${
          userId ? `&userId=${encodeURIComponent(userId)}` : ''
        }`,
        { signal },
      ),
    placeholderData: keepPreviousData,
  });

export const ADMIN_LOGS_LIMIT = LIMIT;
