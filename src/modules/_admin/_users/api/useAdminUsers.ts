import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';




export interface AdminUserRow {
  user_id: string;
  login: string;
  last_active_at: string | null;
  onboarded: boolean;
  operationsCount: number;
  categoriesCount: number;
  incomeCount: number;
  expenseCount: number;
  transferCount: number;

  accountsCount: number;

  goalsCount: number;
}


export type UseAdminUsersRequest = void;


export type UseAdminUsersResponse = AdminUserRow[];

export const useAdminUsers = () =>
  useQuery<UseAdminUsersResponse>({
    queryKey: ['admin', 'users'],
    queryFn: async ({ signal }) =>
      (await api.get<UseAdminUsersResponse>('/admin/users', { signal })) ?? [],
    staleTime: 5 * 60_000,
  });
