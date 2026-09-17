import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

export interface AdminUserOption {
  userId: string;
  login: string;
}

export type UseAdminUserOptionsRequest = void;

export type UseAdminUserOptionsResponse = AdminUserOption[];

export const useAdminUserOptions = () =>
  useQuery<UseAdminUserOptionsResponse>({
    queryKey: ['admin', 'userOptions'],
    queryFn: async ({ signal }) =>
      (await api.get<UseAdminUserOptionsResponse>('/admin/users/options', { signal })) ?? [],
    staleTime: 5 * 60_000,
  });
