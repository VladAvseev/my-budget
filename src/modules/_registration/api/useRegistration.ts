import type { LoginCredentials } from '@/shared/supabase/types/auth.types';
import { authService } from '@/shared/supabase/services/auth';
import { getErrorMessage } from '@/shared/utils';
import { useMutation } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { errorAtom } from '../atoms/registration';

export const useRegistration = () => {
  const setError = useSetAtom(errorAtom);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.signUp(credentials.email, credentials.password),
    onSuccess: (result) => {
      if (result.error) {
        setError(getErrorMessage(result.error.message));
        return;
      }
      navigate('/');
    },
    onError: (error: Error) => {
      setError(getErrorMessage(error));
    },
  });
};