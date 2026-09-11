import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

/** GET /admin/dashboard/storage-breakdown: размер БД + разбивка по таблицам. */

/** Размер таблицы (pg_total_relation_size: данные + индексы + TOAST), байты. */
export interface TableStorageSize {
  name: string;
  sizeBytes: number;
}

/** Ответ GET /admin/dashboard/storage-breakdown (карточка «Хранилище»). */
export interface StorageBreakdown {
  databaseBytes: number;
  tables: TableStorageSize[];
}

/** Запроса нет. */
export type UseAdminStorageBreakdownRequest = void;

/** Ответ GET /admin/dashboard/storage-breakdown. */
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
