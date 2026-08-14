import { accumulationsService, type Accumulation } from '@/shared/supabase/services/accumulations';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const removeAccumulationMutationKey = ['removeAccumulation'] as const;

export const useRemoveAccumulation = (userId: string) => {
  const queryClient = useQueryClient();
  const key = ['accumulations', userId];

  return useMutation({
    mutationKey: removeAccumulationMutationKey,
    mutationFn: (id: string) => accumulationsService.removeAccumulation(id),
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
    },
  });
};