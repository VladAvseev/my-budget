import { api } from '@/shared/api/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * DELETE /admin/users/:id — безвозвратное удаление аккаунта админкой.
 * Оптимистичного удаления нет: счётчики в таблице агрегируются на сервере,
 * а сама операция необратима — ждём ответ и инвалидируем список/статистику.
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'deleteUser'],
    mutationFn: async (id: string) => {
      await api.del(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};
