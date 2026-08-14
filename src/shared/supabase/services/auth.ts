import { supabase } from '../supabase';
import type { AuthError, AuthEvent, AuthResponse, Session } from '../types/auth.types';

class AuthService {
  async signUp(
    email: string,
    password: string,
    metadata?: Record<string, any>,
  ): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    return { data, error } as AuthResponse;
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error } as AuthResponse;
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error: error as AuthError | null };
  }

  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    return { session: session as Session | null, error: error as AuthError | null };
  }

  async getToken(): Promise<string | null> {
    const { session } = await this.getSession();
    return session?.access_token || null;
  }

  async refreshSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();
    return { session: session as Session | null, error: error as AuthError | null };
  }

  async resetPassword(email: string): Promise<{ data: any; error: AuthError | null }> {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    return { data, error: error as AuthError | null };
  }

  async updatePassword(newPassword: string): Promise<{ data: any; error: AuthError | null }> {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error: error as AuthError | null };
  }

  onAuthStateChange(callback: (event: AuthEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event as AuthEvent, session as Session | null);
    });
  }
}

export const authService = new AuthService();
