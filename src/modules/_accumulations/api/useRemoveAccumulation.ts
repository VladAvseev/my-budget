import { supabase } from '@/shared/supabase/supabase';
import type { Accumulation } from '@/shared/supabase/types/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const removeAccumulationMutationKey = ['removeAccumulation'] as const;

export const useRemoveAccumulation = (userId: string) => {
  const queryClient = useQueryClient();
  const key = ['accumulations', userId];

  return useMutation({
    mutationKey: removeAccumulationMutationKey,
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('delete_accumulation', { p_id: id });
      if (error) throw error;
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
    },
  });
};