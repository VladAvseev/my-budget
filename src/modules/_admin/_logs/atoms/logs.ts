import type { AdminLogsPeriod } from '../api/useAdminLogsMetrics';
import type {
  AdminLogsSortField,
  AdminLogsSortOrder,
  AdminLogsStatusFilter,
} from '../api/useAdminLogs';
import type { AdminAudience, AdminChartMetric, AdminLogsBucket } from '@/shared/api/types/admin';
import { atom } from 'jotai';

export const logsPeriodAtom = atom<AdminLogsPeriod>('30d');
export const logsStatusAtom = atom<AdminLogsStatusFilter>('all');
export const logsPageAtom = atom(1);

export const logsSortAtom = atom<AdminLogsSortField>('date');
export const logsSortOrderAtom = atom<AdminLogsSortOrder>('desc');

export const LOG_USER_ANONYMOUS = 'anonymous';
export const logsUserAtom = atom('');

export const logsMethodsAtom = atom<string[]>([]);

export const logsDynamicsAudienceAtom = atom<AdminAudience>('all');
export const logsDynamicsMetricAtom = atom<AdminChartMetric>('count');
export const logsDynamicsBucketAtom = atom<AdminLogsBucket>('hour');
