import { authService } from '@/shared/api/services/auth';
import { useMutation } from '@tanstack/react-query';

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (newPassword: string) => authService.updatePassword(newPassword),
  });
};
