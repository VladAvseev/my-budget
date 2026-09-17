import { api } from '@/shared/api/http';
import { useAuth } from '@/shared/api/authProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface ConsentStatus {
  needsConsent: boolean;

  reason: 'missing' | 'revoked' | 'version_changed' | null;
  currentVersion: string | null;

  grantedVersion: string | null;
}

export const consentStatusQueryKey = (userId?: string) => ['consent', userId, 'status'] as const;

export type UseConsentStatusResponse = ConsentStatus;

export const useConsentStatus = () => {
  const { isAuthenticated, user } = useAuth();

  return useQuery<UseConsentStatusResponse>({
    queryKey: consentStatusQueryKey(user?.id),
    enabled: isAuthenticated && Boolean(user?.id),
    staleTime: 60_000,
    queryFn: ({ signal }) => api.get<ConsentStatus>('/consent/status', { signal }),
  });
};

export const useGrantConsent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<ConsentStatus>('/consent/grant'),
    onSuccess: (status) => {
      queryClient.setQueryData(consentStatusQueryKey(user?.id), status);

      void queryClient.invalidateQueries({ queryKey: ['legal'] });
    },
  });
};

export const useRevokeConsent = () =>
  useMutation({
    mutationFn: () => api.post<null>('/consent/revoke'),
  });

export const useDeleteAccount = () =>
  useMutation({
    mutationFn: () => api.del<null>('/users/me'),
  });
