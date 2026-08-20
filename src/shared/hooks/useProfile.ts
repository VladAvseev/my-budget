import { useAuth } from '@/shared/supabase/authProvider';
import { supabase } from '@/shared/supabase/supabase';
import type { Profile } from '@/shared/supabase/types/domain';
import { useQuery } from '@tanstack/react-query';

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.rpc('get_or_create_profile', {
        p_email: user.email,
      });
      if (error) throw error;
      return (data as Profile) ?? null;
    },
  });
};