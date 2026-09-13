import { api } from '@/shared/api/http';
import { useAuth } from '@/shared/api/authProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Consent-gate (п.5 требований): серверный _consent. Статус читается после
 * каждого входа, принятие — POST /consent/grant (версию сервер берёт сам),
 * отзыв и удаление аккаунта — POST /consent/revoke и DELETE /users/me: оба
 * стирают финансовые данные иlogout'ят со всех устройств, поэтому после
 * успеха вызывающий обязан сделать signOut() (эмит SIGNED_OUT почистит кэш).
 */

/** Ответ GET /consent/status (зеркалит серверный ConsentStateDto). */
export interface ConsentStatus {
  needsConsent: boolean;
  /** null — consent не требуется; 'erased' на сервере тоже даёт 'revoked'. */
  reason: 'missing' | 'revoked' | 'version_changed' | null;
  currentVersion: string | null;
  /** Версия из последней grant-записи журнала; null — согласие не принималось. */
  grantedVersion: string | null;
}

export const consentStatusQueryKey = (userId?: string) => ['consent', userId, 'status'] as const;

export type UseConsentStatusResponse = ConsentStatus;

/**
 * Статус согласия текущего пользователя. Держить всегда смонтированным
 * дешевле, чем перечитывать на каждой странице: staleTime 60 c совпадает
 * с серверным кэшем requireConsent.
 */
export const useConsentStatus = () => {
  const { isAuthenticated, user } = useAuth();

  return useQuery<UseConsentStatusResponse>({
    queryKey: consentStatusQueryKey(user?.id),
    enabled: isAuthenticated && Boolean(user?.id),
    staleTime: 60_000,
    queryFn: ({ signal }) => api.get<ConsentStatus>('/consent/status', { signal }),
  });
};

/** Принять текущую версию согласия (consent-gate). */
export const useGrantConsent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<ConsentStatus>('/consent/grant'),
    onSuccess: (status) => {
      queryClient.setQueryData(consentStatusQueryKey(user?.id), status);
      // После принятия «текущего» текста следующая публикация должна попасться
      // свежим — на всякий снимем кэш документа.
      void queryClient.invalidateQueries({ queryKey: ['legal'] });
    },
  });
};

/** Отозвать согласие: сервер обезличивает данные сразу (п.7). */
export const useRevokeConsent = () =>
  useMutation({
    mutationFn: () => api.post<null>('/consent/revoke'),
  });

/** Удалить аккаунт (обезличивание). Доступно и из gate'а, и из профиля (п.5). */
export const useDeleteAccount = () =>
  useMutation({
    mutationFn: () => api.del<null>('/users/me'),
  });
