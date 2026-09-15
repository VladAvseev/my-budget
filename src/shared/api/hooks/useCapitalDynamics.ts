import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

/**
 * Точка динамики капитала (ответ GET /reports/capital-dynamics): одна строка
 * на период-отчёт — месяц начала периода 'YYYY-MM' + дельта (income −
 * expense всех операций отчёта; у пустого отчёта 0). Отсортированы по
 * началу периода, месяц может повторяться у нескольких отчётов одного месяца.
 */
export interface CapitalMonth {
  month: string;
  delta: number;
}

/**
 * Отдельный префикс-сегмент ('capital-dynamics') вместо userId: график
 * инвалидируется из мутаций модуля _reports без знания userId.
 */
export const capitalDynamicsQueryKey = ['reports', 'capital-dynamics'] as const;

/** Ответ GET /reports/capital-dynamics. */
export type UseCapitalDynamicsResponse = CapitalMonth[];

export const useCapitalDynamics = () =>
  useQuery<UseCapitalDynamicsResponse>({
    queryKey: capitalDynamicsQueryKey,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseCapitalDynamicsResponse>('/reports/capital-dynamics', { signal })) ?? [],
  });
