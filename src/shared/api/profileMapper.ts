import type { ApiUser } from '@/shared/api/http';
import type { Profile } from '@/shared/api/types/domain';

/**
 * Публичный профиль API (camelCase PublicUser) → прежняя snake_case-форма
 * Profile: потребители (кэш ['profile'], валюта, онбординг)
 * не менялись при переезде на собственный бэкенд.
 *
 * Используется и хуком useProfile, и AuthProvider для посева кэша из
 * сессии (login/refresh уже приносят ApiUser — лишний GET /users/me не нужен).
 */
export const toProfile = (u: ApiUser): Profile => ({
  user_id: u.id,
  login: u.login,
  currency: u.currency,
  onboarded: u.onboarded,
  role: u.role,
  last_active_at: u.lastActiveAt,
  created_at: u.createdAt,
  updated_at: u.updatedAt,
});
