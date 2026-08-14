import { useAuth } from '@/shared/supabase/authProvider';
import { profilesService, type Profile } from '@/shared/supabase/services/profiles';
import { useQuery } from '@tanstack/react-query';

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await profilesService.getOrCreateProfile(user.id, {
        email: user.email,
      });
      if (error) throw error;
      return data ?? null;
    },
  });
};
