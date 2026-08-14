import { useAuth } from '@/shared/supabase/authProvider';
import { profilesService, type Profile } from '@/shared/supabase/services/profiles';
import { useQuery } from '@tanstack/react-query';

export const useShowNews = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const profileQuery = useQuery<Profile | null>({
    queryKey: ['profile', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await profilesService.getOrCreateProfile(userId, {
        email: user.email,
      });
      if (error) throw error;
      return data ?? null;
    },
  });

  return {
    showNews: profileQuery.data?.show_news ?? false,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
  };
};
