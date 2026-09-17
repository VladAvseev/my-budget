import { api } from '@/shared/api/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type UseDeleteAdminUserRequest = string;

export type UseDeleteAdminUserResponse = void;

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation<UseDeleteAdminUserResponse, Error, UseDeleteAdminUserRequest>({
    mutationFn: async (userId) => {
      await api.del(`/admin/users/${userId}`);
    },
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
};
