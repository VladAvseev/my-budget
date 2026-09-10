import { api } from '@/shared/api/http';
import type { Report, ReportInput } from '@/shared/api/types/domain';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * POST /reports: body в camelCase; сервер сам решает
 * уникальность кода ('Такой период уже существует' → 409) и то, что бюджет
 * пишется только при включённом daily-режиме. Оптимистичная вставка прежняя.
 */
const createReportMutationKey = ['createReport'] as const;

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createReportMutationKey,
    mutationFn: async (input: ReportInput) => {
      await api.post('/reports', {
        name: input.name.trim(),
        code: input.code ?? '',
        hasDailyExpenses: input.hasDailyExpenses ?? false,
        dailyBudget: input.dailyBudget ?? null,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
      });
    },
    onMutate: async (input) => {
      const key = ['reports'];
      const previous = queryClient.getQueryData<Report[]>(key) ?? [];

      const now = new Date().toISOString();
      const hasDailyExpenses = input.hasDailyExpenses ?? false;
      const optimistic: Report & OptimisticItem = {
        id: createOptimisticId(),
        user_id: '',
        name: input.name,
        code: input.code ?? '',
        has_daily_expenses: hasDailyExpenses,
        daily_budget:
          hasDailyExpenses && input.dailyBudget != null ? String(input.dailyBudget) : null,
        period_start: input.periodStart,
        period_end: input.periodEnd,
        created_at: now,
        updated_at: now,
        _optimistic: true,
      };

      queryClient.setQueryData(key, [optimistic, ...previous]);

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      queryClient.setQueryData(['reports'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['onboardingCounts'] });
    },
  });
};
