import { api } from '@/shared/api/http';
import type { Accumulation } from '@/shared/api/types/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** DELETE /accumulations/:id (порт delete_accumulation) + оптимистика. */
const removeAccumulationMutationKey = ['removeAccumulation'] as const;

export const useRemoveAccumulation = (userId: string) => {
  const queryClient = useQueryClient();
  const key = ['accumulations', userId];

  return useMutation({
    mutationKey: removeAccumulationMutationKey,
    mutationFn: async (id: string) => {
      await api.del(`/accumulations/${id}`);
    },
    onMutate: async (id) => {
      const previous = queryClient.getQueryData<Accumulation[]>(key) ?? [];

      queryClient.setQueryData<Accumulation[]>(key, (items = []) =>
        items.filter((item) => item.id !== id),
      );

      return { previous };
    },
    onError: (_error, _id, context) => {
      if (!context) return;
      queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['accumulations', userId] });
      queryClient.invalidateQueries({ queryKey: ['userSummary', userId] });
    },
  });
};
