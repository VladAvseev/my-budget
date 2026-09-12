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

/**
 * Сервис авторизации поверх REST-бэкенда (`server/`, модуль _auth).
 *
 * Хранение пары access/refresh и автообновление токена — на http.ts; здесь
 * только вызовы /auth/*, нормализация ошибок и шина событий смены сессии,
 * на которую подписывается AuthProvider.
 */

function toAuthError(error: unknown): AuthError {
  if (error instanceof ApiError) {
    return { message: error.message, status: error.status, name: 'ApiError' };
  }
  if (error instanceof Error) {
    return { message: error.message, status: 0, name: error.name };
  }
  return { message: 'Неизвестная ошибка', status: 0, name: 'UnknownError' };
}

// ── шина событий смены сессии ───────────────────────────────────────────────

type AuthListener = (event: AuthEvent, session: AuthSession | null) => void;
const authListeners = new Set<AuthListener>();

function emit(event: AuthEvent): void {
  const session = getStoredSession();
  authListeners.forEach((cb) => cb(event, session));
}

/** http.ts чистит хранилище при неудачном refresh — транслируем в SIGNED_OUT. */
subscribeSessionChange(() => {
  if (!getStoredSession() && wasSignedIn) {
    wasSignedIn = false;
    emit('SIGNED_OUT');
  }
});
let wasSignedIn = Boolean(getStoredSession());

// ── сервис ──────────────────────────────────────────────────────────────────

class AuthService {
  /**
   * POST /auth/register. Писем о подтверждении сервер не шлёт и сразу выдаёт
   * сессию, поэтому SIGNED_IN эмитится немедленно.
   */
  async signUp(login: string, password: string): Promise<AuthResponse> {
    try {
      const session = await api.publicPost<ApiSession>('/auth/register', { login, password });
      storeSession(session);
      wasSignedIn = true;
      emit('SIGNED_IN');
      return { data: { user: session.user }, error: null };
    } catch (error) {
      return { data: { user: null }, error: toAuthError(error) };
    }
  }

  /** POST /auth/login — новая «сессия-устройство» (одна строка в refresh_tokens). */
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

  /**
   * POST /auth/logout + локальная зачистка. Отозвать стараемся только свою
   * текущую сессию — другие устройства пользователя продолжают жить.
   * Сетевую ошибку игнорируем: локально выход всё равно должен случиться.
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    const stored = getStoredSession();
    if (stored?.refreshToken) {
      try {
        await api.publicPost('/auth/logout', { refreshToken: stored.refreshToken });
      } catch {
        /* logout идемпотентен и локален — сеть не должна блокировать выход */
      }
    }
    clearStoredSession();
    wasSignedIn = false;
    emit('SIGNED_OUT');
    return { error: null };
  }

  /**
   * Начальное состояние для провайдера: «есть ли живая сессия в хранилище».
   * Проверять токен на сервере не нужно: при истёкшем access http сам
   * обновит пару при первом же запросе.
   */
  async getSession(): Promise<{ session: AuthSession | null; error: AuthError | null }> {
    return { session: getStoredSession(), error: null };
  }

  async getToken(): Promise<string | null> {
    return getStoredSession()?.accessToken ?? null;
  }

  /**
   * PATCH /auth/password. Сервер после смены отзывает ВСЕ refresh-токены
   * (другие устройства обязаны перелогиниться), поэтому текущую сессию
   * тоже уничтожаем локально: провайдер поймает SIGNED_OUT, гард
   * отведёт на /login — вход новым паролем.
   */
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

  /** Подписка на смену сессии; возвращает функцию отписки в привычной обёртке. */
  onAuthStateChange(callback: AuthListener) {
    authListeners.add(callback);
    return { data: { subscription: { unsubscribe: () => authListeners.delete(callback) } } };
  }
}

export const authService = new AuthService();
