import type { AdminLogsPeriod } from '../api/useAdminLogsMetrics';
import type {
  AdminLogsSortField,
  AdminLogsSortOrder,
  AdminLogsStatusFilter,
} from '../api/useAdminLogs';
import type { AdminAudience, AdminChartMetric, AdminLogsBucket } from '@/shared/api/types/admin';
import { atom } from 'jotai';

/** Фильтры вкладки «Логи»: персистировать не нужно — это сеансовый выбор. */
export const logsPeriodAtom = atom<AdminLogsPeriod>('30d');
export const logsStatusAtom = atom<AdminLogsStatusFilter>('all');
export const logsPageAtom = atom(1);

/** Сортировка таблицы логов: поле + порядок (по умолчанию — свежие сверху). */
export const logsSortAtom = atom<AdminLogsSortField>('date');
export const logsSortOrderAtom = atom<AdminLogsSortOrder>('desc');

/**
 * Фильтр логов по автору: '' — все пользователи, LOG_USER_ANONYMOUS —
 * запросы без авторизации, иначе uuid пользователя.
 */
export const LOG_USER_ANONYMOUS = 'anonymous';
export const logsUserAtom = atom('');

/**
 * Фильтр логов по HTTP-методам: выбранные методы ('GET', 'POST', ...);
 * пустой список — запросы любыми методами.
 */
export const logsMethodsAtom = atom<string[]>([]);

/**
 * Фильтры графика динамики логов (карточка LogsDynamicsCard): в атомах, чтобы
 * выбор переживал переход на другую вкладку и обратно.
 */
export const logsDynamicsAudienceAtom = atom<AdminAudience>('all');
export const logsDynamicsMetricAtom = atom<AdminChartMetric>('count');
export const logsDynamicsBucketAtom = atom<AdminLogsBucket>('hour');
