import type { ApiUser, StoredSession } from '../http';

export type AuthUser = ApiUser;

export type AuthSession = StoredSession;

export interface AuthError {
  message: string;
  status: number;
  name: string;
}

export interface AuthResponse {
  data: {
    user: AuthUser | null;
  };
  error: AuthError | null;
}

export type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT';

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  login: string;
  password: string;

  consent?: boolean;
}

export interface AuthContextType extends AuthState {
  signUp: (login: string, password: string, consent: boolean) => Promise<AuthResponse>;
  signIn: (login: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  getToken: () => Promise<string | null>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}
