import { api } from '@/shared/api/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** DELETE /admin/users/:userId — физическое удаление пользователя со всеми данными. */

/** Запрос — id удаляемого пользователя. */
export type UseDeleteAdminUserRequest = string;

/** Ответ DELETE /admin/users/:userId — 204 без тела. */
export type UseDeleteAdminUserResponse = void;

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation<UseDeleteAdminUserResponse, Error, UseDeleteAdminUserRequest>({
    mutationFn: async (userId) => {
      await api.del(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      // Удаление пользователя меняет сводку дашборда, динамику операций,
      // разбивку хранилища, таблицу пользователей и опции авторов в логах —
      // инвалидируем всё дерево ['admin'] одним вызовом.
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
};
