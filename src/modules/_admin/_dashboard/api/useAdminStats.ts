import { api } from '@/shared/api/http';
import type { AdminDashboardStats } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /admin/dashboard/stats (порт admin_get_dashboard_stats). */
export const useAdminStats = () =>
  useQuery<AdminDashboardStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<AdminDashboardStats>('/admin/dashboard/stats'),
  });
