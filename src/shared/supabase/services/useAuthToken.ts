// src/hooks/useAuthToken.ts
import { useCallback } from 'react';
import { useAuth } from '../authProvider';

interface AuthHeaders {
  Authorization: string;
  'Content-Type': string;
}

export const useAuthToken = () => {
  const { session, getToken } = useAuth();

  const getAuthHeaders = useCallback(async (): Promise<AuthHeaders> => {
    const token = await getToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, [getToken]);

  const isTokenExpired = useCallback((): boolean => {
    if (!session) return true;
    const expiresAt = session.expires_at * 1000;
    return Date.now() >= expiresAt;
  }, [session]);

  const tokenExpiresIn = useCallback((): number => {
    if (!session) return 0;
    const expiresAt = session.expires_at * 1000;
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  }, [session]);

  return {
    token: session?.access_token,
    isTokenExpired,
    tokenExpiresIn,
    getAuthHeaders,
  };
};
