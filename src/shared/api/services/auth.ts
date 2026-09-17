import {
  ApiError,
  api,
  clearStoredSession,
  getStoredSession,
  storeSession,
  subscribeSessionChange,
  type ApiSession,
} from '../http';
import type { AuthError, AuthEvent, AuthResponse, AuthSession } from '../types/auth.types';

function toAuthError(error: unknown): AuthError {
  if (error instanceof ApiError) {
    return { message: error.message, status: error.status, name: 'ApiError' };
  }
  if (error instanceof Error) {
    return { message: error.message, status: 0, name: error.name };
  }
  return { message: 'Неизвестная ошибка', status: 0, name: 'UnknownError' };
}

type AuthListener = (event: AuthEvent, session: AuthSession | null) => void;
const authListeners = new Set<AuthListener>();

function emit(event: AuthEvent): void {
  const session = getStoredSession();
  authListeners.forEach((cb) => cb(event, session));
}

subscribeSessionChange(() => {
  if (!getStoredSession() && wasSignedIn) {
    wasSignedIn = false;
    emit('SIGNED_OUT');
  }
});
let wasSignedIn = Boolean(getStoredSession());

class AuthService {

  async signUp(login: string, password: string, consent: boolean): Promise<AuthResponse> {
    try {
      const session = await api.publicPost<ApiSession>('/auth/register', {
        login,
        password,
        consent,
      });
      storeSession(session);
      wasSignedIn = true;
      emit('SIGNED_IN');
      return { data: { user: session.user }, error: null };
    } catch (error) {
      return { data: { user: null }, error: toAuthError(error) };
    }
  }

  async signIn(login: string, password: string): Promise<AuthResponse> {
    try {
      const session = await api.publicPost<ApiSession>('/auth/login', { login, password });
      storeSession(session);
      wasSignedIn = true;
      emit('SIGNED_IN');
      return { data: { user: session.user }, error: null };
    } catch (error) {
      return { data: { user: null }, error: toAuthError(error) };
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    const stored = getStoredSession();
    if (stored?.refreshToken) {
      await api.publicPost('/auth/logout', { refreshToken: stored.refreshToken }).catch(() => undefined);
    }
    clearStoredSession();
    wasSignedIn = false;
    emit('SIGNED_OUT');
    return { error: null };
  }

  async getSession(): Promise<{ session: AuthSession | null; error: AuthError | null }> {
    return { session: getStoredSession(), error: null };
  }

  async getToken(): Promise<string | null> {
    return getStoredSession()?.accessToken ?? null;
  }

  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      await api.patch<null>('/auth/password', { newPassword });
    } catch (error) {
      return { error: toAuthError(error) };
    }
    clearStoredSession();
    wasSignedIn = false;
    emit('SIGNED_OUT');
    return { error: null };
  }

  onAuthStateChange(callback: AuthListener) {
    authListeners.add(callback);
    return { data: { subscription: { unsubscribe: () => authListeners.delete(callback) } } };
  }
}

export const authService = new AuthService();
