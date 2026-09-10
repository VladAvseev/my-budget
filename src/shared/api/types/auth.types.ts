import type { ApiUser, StoredSession } from '../http';

/** Пользователь в контексте авторизации — публичные поля из ответа API. */
export type AuthUser = ApiUser;

/** Активная сессия: пара токенов + абсолютное время жизни access-токена. */
export type AuthSession = StoredSession;

/** Ошибка auth-слоя: текст (сервер отдаёт его по-русски) + HTTP-статус. */
export interface AuthError {
  message: string;
  status: number;
  name: string;
}

/** Ответ signUp/signIn: пользователь либо null, если что-то пошло не так. */
export interface AuthResponse {
  data: {
    user: AuthUser | null;
  };
  error: AuthError | null;
}

/** События смены сессии, которые реально происходят в приложении. */
export type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT';

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  getToken: () => Promise<string | null>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}
