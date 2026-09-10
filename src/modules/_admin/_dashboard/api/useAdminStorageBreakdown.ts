import { api } from '@/shared/api/http';
import type { StorageBreakdown } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/** GET /admin/dashboard/storage-breakdown: размер БД + разбивка по таблицам. */
export const useAdminStorageBreakdown = () =>
  useQuery<StorageBreakdown>({
    queryKey: ['admin', 'storageBreakdown'],
    queryFn: () => api.get<StorageBreakdown>('/admin/dashboard/storage-breakdown'),
  });
