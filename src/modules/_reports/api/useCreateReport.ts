import {
  capitalDynamicsQueryKey,
  growthDynamicsQueryKey,
  invalidateHomeCaches,
} from '@/shared/api/hooks';
import { api } from '@/shared/api/http';
import type { Report } from '@/shared/api/types/domain';
import { createOptimisticId, type OptimisticItem } from '@/shared/optimistic';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * POST /reports: body в camelCase; сервер сам решает
 * уникальность кода ('Такой период уже существует' → 409) и то, что бюджет
 * пишется только при включённом daily-режиме. Оптимистичная вставка прежняя.
 */
const createReportMutationKey = ['createReport'] as const;

/** Запрос POST /reports — payload модалки (прежний ReportInput). */
export interface UseCreateReportRequest {
  name: string;
  code?: string;
  hasDailyExpenses?: boolean;
  dailyBudget?: number | null;
  periodStart: string;
  periodEnd: string;
}

/** Ответ POST /reports — созданный отчёт (201). */
export type UseCreateReportResponse = Report;

/** Тело на проводе (серверный CreateReportInput). */
interface CreateReportBody {
  name: string;
  code: string;
  hasDailyExpenses: boolean;
  dailyBudget: number | null;
  periodStart: string;
  periodEnd: string;
}

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createReportMutationKey,
    mutationFn: async (input: UseCreateReportRequest) => {
      const body: CreateReportBody = {
        name: input.name.trim(),
        code: input.code ?? '',
        hasDailyExpenses: input.hasDailyExpenses ?? false,
        dailyBudget: input.dailyBudget ?? null,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
      };
      return api.post<UseCreateReportResponse>('/reports', body);
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
        daily_budget: hasDailyExpenses && input.dailyBudget != null ? input.dailyBudget : null,
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
      // новый более ранний период удлиняет ряд помесячной динамики роста
      queryClient.invalidateQueries({ queryKey: growthDynamicsQueryKey, exact: true });
      queryClient.invalidateQueries({ queryKey: capitalDynamicsQueryKey, exact: true });
      invalidateHomeCaches(queryClient);
    },
  });
};
