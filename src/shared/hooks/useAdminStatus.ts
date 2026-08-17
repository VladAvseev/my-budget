import { useProfile } from './useProfile';

export const useAdminStatus = () => {
  const profileQuery = useProfile();

  return {
    isAdmin: profileQuery.data?.role === 'admin',
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
  };
};
