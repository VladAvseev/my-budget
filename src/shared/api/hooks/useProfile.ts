import { api } from '@/shared/api/http';
import { useAuth } from '@/shared/api/authProvider';
import type { ApiUser } from '@/shared/api/http';
import { toProfile } from '@/shared/api/profileMapper';
import type { Profile } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/**
 * Профиль пользователя: GET /users/me.
 * Сервер отдаёт camelCase PublicUser; toProfile (profileMapper) адаптирует
 * его к прежнему snake_case формату Profile. AuthProvider сеет этот кэш из
 * сессии, поэтому на смонтированной странице запрос уходит в фон или не
 * уходит вовсе. Request нет — пользователь определяется по токену.
 */

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
