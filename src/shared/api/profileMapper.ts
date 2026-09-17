import type { ApiUser } from '@/shared/api/http';
import type { Profile } from '@/shared/api/types/domain';

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
