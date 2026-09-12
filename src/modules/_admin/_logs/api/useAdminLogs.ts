import { api } from '@/shared/api/http';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

/** Статус-фильтр списка: все / только успешные (<400) / только с ошибкой (≥400). */
export type AdminLogsStatusFilter = 'all' | 'success' | 'error';

/** Поле и порядок сортировки строк логов (query sort/order в GET /admin/logs). */
export type AdminLogsSortField = 'date' | 'duration';
export type AdminLogsSortOrder = 'asc' | 'desc';

/**
 * Одна строка лога: сервер хранит только метод, путь, статус, длительность,
 * автора и текст ошибки (для ответов с статусом >= 400).
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
  /** Логин автора (для отображения в таблице логов). */
  userLogin: string | null;
  /** true — на момент запроса был валидный access-токен. */
  isAuthenticated: boolean;
}

/** Страница логов (ответ GET /admin/logs). */
export interface AdminLogsPage {
  items: AdminLogRow[];
  total: number;
  page: number;
  limit: number;
}

const LIMIT = 50;

/** Параметры GET /admin/logs (фильтры, сортировка, пагинация). */
export interface UseAdminLogsRequest {
  status: AdminLogsStatusFilter;
  /** '' — все авторы, 'anonymous' — без авторизации, иначе uuid пользователя. */
  userId: string;
  /** Выбранные HTTP-методы ('GET', 'POST', ...); пусто — все методы. */
  methods: string[];
  page: number;
  sort: AdminLogsSortField;
  order: AdminLogsSortOrder;
}

/** Ответ GET /admin/logs. */
export type UseAdminLogsResponse = AdminLogsPage;

/** GET /admin/logs: страница логов запросов с фильтром, сортировкой и пагинацией. */
export const useAdminLogs = ({
  status,
  userId,
  methods,
  page,
  sort,
  order,
}: UseAdminLogsRequest) =>
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
