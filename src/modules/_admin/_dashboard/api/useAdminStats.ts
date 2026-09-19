import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';


export interface AdminDashboardStats {
  users: {
    total: number;
    onboarded: number;
  };

  activity: {
    dau: number;
    wau: number;
    mau: number;
    qau: number;
    sau: number;
    yau: number;
  };

  churn: {
    inactive1d: number;
    inactive7d: number;
    inactive30d: number;
    inactive90d: number;
    inactive180d: number;
    inactive365d: number;
  };
  operations: {
    total: number;
    income: number;
    expense: number;
    transfer: number;
  };
}


export type UseAdminStatsRequest = void;


export type UseAdminStatsResponse = AdminDashboardStats;

export const useAdminStats = () =>
  useQuery<UseAdminStatsResponse>({
    queryKey: ['admin', 'stats'],
    queryFn: ({ signal }) => api.get<UseAdminStatsResponse>('/admin/dashboard/stats', { signal }),
    staleTime: 5 * 60_000,
  });
