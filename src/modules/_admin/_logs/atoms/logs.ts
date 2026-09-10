import type {
  AdminLogsPeriod,
  AdminLogsSortField,
  AdminLogsSortOrder,
  AdminLogsStatusFilter,
} from '@/shared/api/types/domain';
import { atom } from 'jotai';

/** Фильтры вкладки «Логи»: персистировать не нужно — это сеансовый выбор. */
export const logsPeriodAtom = atom<AdminLogsPeriod>('all');
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
