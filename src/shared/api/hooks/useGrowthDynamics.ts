import { api } from '@/shared/api/http';
import { useQuery } from '@tanstack/react-query';

/**
 * Точка помесячной динамики роста накоплений (ответ GET /accumulations/dynamics):
 * месяц 'YYYY-MM' + нетто-прирост (savings минус savings_out-операций отчётов
 * этого месяца, нули-заполнители включительно).
 */
export interface GrowthMonth {
  month: string;
  savings: number;
}

/**
 * Отдельный префикс-сегмент ('growth-dynamics') вместо userId: инвалидация
 * списка ['accumulations', userId] не цепляет график, а инвалидировать график
 * из модуля _reports можно без знания userId.
 */
export const growthDynamicsQueryKey = ['accumulations', 'growth-dynamics'] as const;

/** Ответ GET /accumulations/dynamics. */
export type UseGrowthDynamicsResponse = GrowthMonth[];

export const useGrowthDynamics = () =>
  useQuery<UseGrowthDynamicsResponse>({
    queryKey: growthDynamicsQueryKey,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseGrowthDynamicsResponse>('/accumulations/dynamics', { signal })) ?? [],
  });
