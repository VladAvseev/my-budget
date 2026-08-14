import { profilesService } from '@/shared/supabase/services/profiles';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateStartBalance = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (startBalance: number) =>
      profilesService.updateStartBalance(userId, startBalance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};