import { authService } from '@/shared/supabase/services/auth';
import { useMutation } from '@tanstack/react-query';

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (newPassword: string) => authService.updatePassword(newPassword),
  });
};