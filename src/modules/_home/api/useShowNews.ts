import { useProfile } from '@/shared/hooks';

export const useShowNews = () => {
  const profileQuery = useProfile();

  return {
    showNews: profileQuery.data?.show_news ?? false,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
  };
};
