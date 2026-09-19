import { api } from '@/shared/api/http';
import { invalidateMonthCache } from './invalidateMonthCache';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const removeOperationMutationKey = ['removeOperation'] as const;

export type UseRemoveOperationRequest = string;

export type UseRemoveOperationResponse = void;

export const useRemoveOperation = (month: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: removeOperationMutationKey,
    mutationFn: async (id: UseRemoveOperationRequest) => {
      await api.del(`/operations/${id}`);
    },
    onSettled: () => invalidateMonthCache(queryClient, month),
  });
};
