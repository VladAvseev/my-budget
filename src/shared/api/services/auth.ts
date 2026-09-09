import {
  ApiError,
  api,
  clearStoredSession,
  getStoredSession,
  refreshSessionOnce,
  storeSession,
  subscribeSessionChange,
  type ApiSession,
  type ApiUser,
} from '../http';
import type { AuthError, AuthEvent, AuthResponse, Session, User } from '../types/auth.types';

/**
 * Сервис авторизации поверх нового REST-бэкенда (`server/`, модуль _auth).
 *
 * Публичный интерфейс намеренно сохранён прежним (signUp/signIn/signOut/
 * getSession/getToken/refreshSession/updatePassword/onAuthStateChange) —
 * authProvider, страницы логина/регистрации и смена пароля не менялись.
 * Внутри вместо supabase-js: пару access/refresh хранит http.ts,
 * события — своя шина, а legacy-форма Session/User (snake_case поля
 * GoTrue) достраивается адаптерами ниже.
 */

/** Ответ сервера /auth/* (camelCase) → legacy-форма Supabase-сессии. */
function toLegacyUser(u: ApiUser): User {
  return {
    id: u.id,
    email: u.email,
    // Подтверждение email на новом сервере не используется вовсе.
    email_confirmed_at: null,
    created_at: u.createdAt,
    updated_at: u.updatedAt,
    user_metadata: {},
    app_metadata: { provider: 'email' },
  };
}

function toLegacySession(accessToken: string, refreshToken: string, user: ApiUser): Session {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600; // TTL access-токена сервера — 1h
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: 3600,
    expires_at: expiresAt,
    token_type: 'bearer',
    user: toLegacyUser(user),
  };
}

function toAuthError(error: unknown): AuthError {
  if (error instanceof ApiError) {
    return { message: error.message, status: error.status, name: 'ApiError' };
  }
  if (error instanceof Error) {
    return { message: error.message, status: 0, name: error.name };
  }
  return { message: 'Неизвестная ошибка', status: 0, name: 'UnknownError' };
}

// ── минимальная шина AuthStateChange ────────────────────────────────────────

type AuthListener = (event: AuthEvent, session: Session | null) => void;
const authListeners = new Set<AuthListener>();

function emit(event: AuthEvent): void {
  const session = currentSession();
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

function currentSession(): Session | null {
  const stored = getStoredSession();
  if (!stored) return null;
  return toLegacySession(stored.accessToken, stored.refreshToken, stored.user);
}

// ── сервис ──────────────────────────────────────────────────────────────────

class AuthService {
  /**
   * POST /auth/register. Сервер не шлёт писем (в отличие от GoTrue с
   * email-confirmation) и сразу выдаёт сессию — как Supabase с выключенным
   * confirm, поэтому SIGNED_IN эмитится сразу.
   */
  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const session = await api.publicPost<ApiSession>('/auth/register', { email, password });
      storeSession(session);
      wasSignedIn = true;
      emit('SIGNED_IN');
      return { data: { user: toLegacyUser(session.user), session: currentSession() }, error: null };
    } catch (error) {
      return { data: { user: null, session: null }, error: toAuthError(error) };
    }
  }

  /** POST /auth/login — новая «сессия-устройство» (аналог signInWithPassword). */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const session = await api.publicPost<ApiSession>('/auth/login', { email, password });
      storeSession(session);
      wasSignedIn = true;
      emit('SIGNED_IN');
      return { data: { user: toLegacyUser(session.user), session: currentSession() }, error: null };
    } catch (error) {
      return { data: { user: null, session: null }, error: toAuthError(error) };
    }
  }

  /**
   * POST /auth/logout + локальная зачистка. Отозвать стараемся только свою
   * текущую сессию — другие устройства пользователя живут (как signOut()
   * Supabase без scope). Сетевую ошибку игнорируем: локально всё равно выход.
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
   * Аналог supabase.auth.getSession(): «есть ли живая сессия в хранилище».
   * Проверка JWT на сервере не нужна: при истёкшем access http сам
   * обновит пару при первом запросе.
   */
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    return { session: currentSession(), error: null };
  }

  async getToken(): Promise<string | null> {
    return getStoredSession()?.accessToken ?? null;
  }

  /** Принудительный refresh (кнопки «обновить сессию» в коде нет, API сохранён). */
  async refreshSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const ok = await refreshSessionOnce();
    return ok
      ? { session: currentSession(), error: null }
      : {
          session: null,
          error: { message: 'Сессия истекла, войдите заново', status: 401, name: 'AuthApiError' },
        };
  }

  /**
   * Восстановление пароля письмом на новом бэкенде не реализовано
   * (нет e-mail-инфраструктуры). В UI путь не вызывается — метод оставлен
   * для совместимости контекста и честно сообщает о недоступности.
   */
  async resetPassword(email: string): Promise<{ data: null; error: AuthError | null }> {
    void email;
    return {
      data: null,
      error: {
        message: 'Восстановление пароля по email недоступно',
        status: 501,
        name: 'NotImplemented',
      },
    };
  }

  /**
   * PATCH /auth/password. Сервер после смены отзывает ВСЕ refresh-токены
   * (другие устройства обязаны перелогиниться), поэтому текущую сессию
   * тоже уничтожаем локально: провайдер поймает SIGNED_OUT, гард
   * отведёт на /login — вход новым паролем.
   */
  async updatePassword(newPassword: string): Promise<{ data: null; error: AuthError | null }> {
    try {
      await api.patch<null>('/auth/password', { newPassword });
      clearStoredSession();
      wasSignedIn = false;
      emit('SIGNED_OUT');
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: toAuthError(error) };
    }
  }

  /** Подписка на смену сессии; контракт { data: { subscription } } сохранён. */
  onAuthStateChange(callback: AuthListener) {
    authListeners.add(callback);
    return { data: { subscription: { unsubscribe: () => authListeners.delete(callback) } } };
  }
}

export const authService = new AuthService();
