import { useAuth } from '@/shared/supabase/authProvider';
import { profilesService } from '@/shared/supabase/services/profiles';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  return useMutation({
    mutationFn: () => profilesService.updateProfile(userId, { onboarded: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};