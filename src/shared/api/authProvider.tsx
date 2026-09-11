import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from './services/auth';
import { toProfile } from './profileMapper';
import type { ApiUser } from './http';
import { useQueryClient } from '@tanstack/react-query';
import type { AuthContextType, AuthSession, AuthUser } from './types/auth.types';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    /**
     * Посев кэша ['profile'] из сессии: login/register/refresh уже принесли
     * ApiUser — первый экран не ждёт GET /users/me на критическом пути
     * (useProfile догружает данные в фоне по своему staleTime).
     */
    const seedProfile = (u: ApiUser | null | undefined) => {
      if (u) {
        queryClient.setQueryData(['profile', u.id], toProfile(u));
      }
    };

    const initAuth = async () => {
      try {
        const { session } = await authService.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        seedProfile(session?.user);
      } catch (error) {
        console.error('Ошибка инициализации авторизации:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = authService.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      seedProfile(session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signUp: authService.signUp,
    signIn: authService.signIn,
    signOut: async () => {
      const result = await authService.signOut();
      return result;
    },
    getToken: authService.getToken,
    updatePassword: authService.updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
