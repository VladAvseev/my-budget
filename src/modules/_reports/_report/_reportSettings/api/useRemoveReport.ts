import { capitalDynamicsQueryKey, invalidateHomeCaches } from '@/shared/api/hooks';
import { api } from '@/shared/api/http';
import type { Report } from '@/shared/api/types/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** DELETE /reports/:id + оптимистичное удаление из списка. */
const removeReportMutationKey = ['removeReport'] as const;

/** Запроса нет (id — из хука). */
export type UseRemoveReportRequest = void;

/** Ответ DELETE /reports/:id — 204 без тела. */
export type UseRemoveReportResponse = void;

export const useRemoveReport = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: removeReportMutationKey,
    mutationFn: async () => {
      await api.del(`/reports/${id}`);
    },
    onMutate: async () => {
      const key = ['reports'];
      const previous = queryClient.getQueryData<Report[]>(key) ?? [];

      queryClient.setQueryData<Report[]>(key, (items = []) =>
        items.filter((item) => item.id !== id),
      );

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(['reports'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
      // Операции удаляются каскадно вместе с периодом: сбрасываем их кэш,
      // иначе список операций удалённого отчёта мог остаться в памяти.
      queryClient.invalidateQueries({ queryKey: ['reports', id, 'operations'] });
      queryClient.invalidateQueries({ queryKey: ['reports', id, 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['reports', id, 'limits'] });
      queryClient.invalidateQueries({ queryKey: ['userSummary'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['overview', 'category-summary'] });
      queryClient.invalidateQueries({ queryKey: ['onboardingCounts'] });
      queryClient.invalidateQueries({ queryKey: capitalDynamicsQueryKey, exact: true });
      invalidateHomeCaches(queryClient);
    },
  });
};
