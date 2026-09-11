import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

/**
 * Ответ GET /admin/dashboard/stats — структура агрегатов дашборда
 * (серверный AdminDashboardStats в `_admin/types.ts`).
 */
export interface AdminDashboardStats {
  users: {
    total: number;
    /** Пользователи без единого отчёта — «не начали пользоваться». */
    withoutReports: number;
    onboarded: number;
  };
  /** Активные по окну активности (DAU…YAU) — счётчики last_active_at. */
  activity: {
    dau: number;
    wau: number;
    mau: number;
    qau: number;
    sau: number;
    yau: number;
  };
  /** Отток: неактивнее окна (последний из двух — всего, сколько «спят» дольше). */
  churn: {
    inactive1d: number;
    inactive7d: number;
    inactive30d: number;
    inactive90d: number;
    inactive180d: number;
    inactive365d: number;
  };
  reports: {
    total: number;
    withDailyExpenses: number;
  };
  operations: {
    total: number;
    income: number;
    expense: number;
    daily: number;
    /** savings и savings_out считаются вместе. */
    savings: number;
  };
}

/** Запроса нет (пользователь — из JWT, фильтров нет). */
export type UseAdminStatsRequest = void;

/** Ответ GET /admin/dashboard/stats. */
export type UseAdminStatsResponse = AdminDashboardStats;

export const useAdminStats = () =>
  useQuery<UseAdminStatsResponse>({
    queryKey: ['admin', 'stats'],
    queryFn: ({ signal }) => api.get<UseAdminStatsResponse>('/admin/dashboard/stats', { signal }),
    staleTime: 5 * 60_000,
  });
