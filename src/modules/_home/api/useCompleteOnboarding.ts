import { api } from '@/shared/api/http';
import type { ApiUser } from '@/shared/api/http';
import { bootstrapQueryKey, type UseBootstrapResponse } from '@/shared/api/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Завершение онбординга: PATCH /users/me { onboarded: true }.
 */

/** Запроса нет — флаг захардкожен, Variables = undefined. */
export type UseCompleteOnboardingRequest = void;

/** Ответ PATCH /users/me — обновлённый публичный профиль (200). */
export type UseCompleteOnboardingResponse = ApiUser;

/** Тело на проводе (серверный UpdateProfileInput). */
interface UpdateProfileBody {
  onboarded: boolean;
}

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const body: UpdateProfileBody = { onboarded: true };
      return api.patch<UseCompleteOnboardingResponse>('/users/me', body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Онбординг-карточка скрывается сразу, без рефетча всей главной.
      queryClient.setQueryData<UseBootstrapResponse>(bootstrapQueryKey, (prev) =>
        prev ? { ...prev, profile: { ...prev.profile, onboarded: true } } : prev,
      );
    },
  });
};
