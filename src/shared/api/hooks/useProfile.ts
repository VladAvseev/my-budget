import { api } from '@/shared/api/http';
import { useAuth } from '@/shared/api/authProvider';
import type { ApiUser } from '@/shared/api/http';
import type { Profile } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/**
 * Профиль пользователя: GET /users/me.
 * Сервер отдаёт camelCase PublicUser; здесь он адаптируется к прежнему
 * snake_case формату Profile, чтобы компоненты (AccountCard, StartBalanceCard,
 * онбординг) не менялись. Request нет — пользователь определяется по токену.
 */
const toProfile = (u: ApiUser): Profile => ({
  user_id: u.id,
  email: u.email,
  // start_balance типизирован строкой — публичный API профиля уже привязан
  // к Number(...) в UI.
  start_balance: String(u.startBalance),
  currency: u.currency,
  onboarded: u.onboarded,
  role: u.role,
  last_active_at: u.lastActiveAt,
  created_at: u.createdAt,
  updated_at: u.updatedAt,
});

/** Данные хука: ответ GET /users/me, адаптированный к форме Profile. */
export type UseProfileResponse = Profile | null;

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery<UseProfileResponse>({
    queryKey: ['profile', user?.id],
    enabled: Boolean(user?.id),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => toProfile(await api.get<ApiUser>('/users/me', { signal })),
  });
};
