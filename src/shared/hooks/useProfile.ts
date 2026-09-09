import { api } from '@/shared/api/http';
import { useAuth } from '@/shared/api/authProvider';
import type { ApiUser } from '@/shared/api/http';
import type { Profile } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/**
 * Профиль пользователя: GET /users/me (порт RPC get_or_create_profile).
 * «Or create» на новом сервере не нужен — строку создаёт регистрация,
 * а сервер отдаёт camelCase PublicUser; здесь он адаптируется к прежнему
 * snake_case формату Profile, чтобы компоненты (AccountCard, StartBalanceCard,
 * онбординг) не менялись.
 */
const toProfile = (u: ApiUser): Profile => ({
  user_id: u.id,
  email: u.email,
  // start_balance типизирован строкой (как в прежнем Row profiles) —
  // публичный API профиля уже привязан к Number(...) в UI.
  start_balance: String(u.startBalance),
  currency: u.currency,
  onboarded: u.onboarded,
  role: u.role,
  last_active_at: u.lastActiveAt,
  created_at: u.createdAt,
  updated_at: u.updatedAt,
});

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    enabled: Boolean(user?.id),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => toProfile(await api.get<ApiUser>('/users/me')),
  });
};
