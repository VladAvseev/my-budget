import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

export interface TableStorageSize {
  name: string;
  sizeBytes: number;
}

export interface StorageBreakdown {
  databaseBytes: number;
  tables: TableStorageSize[];
}

export type UseAdminStorageBreakdownRequest = void;

export type UseAdminStorageBreakdownResponse = StorageBreakdown;

export const useAdminStorageBreakdown = () =>
  useQuery<UseAdminStorageBreakdownResponse>({
    queryKey: ['admin', 'storageBreakdown'],
    queryFn: ({ signal }) =>
      api.get<UseAdminStorageBreakdownResponse>('/admin/dashboard/storage-breakdown', {
        signal,
      }),
    staleTime: 5 * 60_000,
  });
