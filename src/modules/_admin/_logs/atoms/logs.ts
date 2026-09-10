import type { AdminLogsPeriod, AdminLogsStatusFilter } from '@/shared/api/types/domain';
import { atom } from 'jotai';

/** Фильтры вкладки «Логи»: персистировать не нужно — это сеансовый выбор. */
export const logsPeriodAtom = atom<AdminLogsPeriod>('7d');
export const logsStatusAtom = atom<AdminLogsStatusFilter>('all');
export const logsPageAtom = atom(1);
