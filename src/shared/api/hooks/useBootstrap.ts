import { api } from '@/shared/api/http';
import type { QueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { OperationSummary } from './useGlobalBalance';

/**
 * GET /users/me/bootstrap — все «цифры» главной за один round-trip
 * (серверный CTE в server/src/modules/_users/repository.ts).
 *
 * Хук общий (а не в modules/_home/api): ключ приходится инвалидировать
 * мутациям отчётов, накоплений, целей и профиля, а импорты между модулями
 * запрещены — точка доступа живёт в shared.
 */

/** Срез профиля для главной. */
export interface BootstrapProfile {
  startBalance: number;
  currency: string | null;
  onboarded: boolean;
}

/** Счётчики онбординг-чеклиста (форма /users/me/onboarding). */
export interface BootstrapOnboarding {
  categories: number;
  reports: number;
  operations: number;
}

/** Карточка «Последний период»: отчёт с максимальной period_end + сводка. */
export interface BootstrapLastReport {
  id: string;
  name: string;
  /** 'YYYY-MM-DD' | null — ключи повторяют серверный ReportDto. */
  period_start: string | null;
  period_end: string | null;
  summary: OperationSummary;
}

/** Элемент структуры накоплений: накопления + знаковые savings-операции. */
export interface BootstrapSavingsItem {
  /** null — без категории (лейбл рисует клиент). */
  categoryId: string | null;
  name: string | null;
  color: string | null;
  amount: number;
}

/** Цель без вычислений: общий прогресс считает computeGoalsOverall. */
export interface BootstrapGoalItem {
  categoryId: string;
  amount: number;
}

/** Данные хука: ответ GET /users/me/bootstrap. */
export interface UseBootstrapResponse {
  profile: BootstrapProfile;
  onboarding: BootstrapOnboarding;
  lastReport: BootstrapLastReport | null;
  globalTotals: OperationSummary & { accumulationsTotal: number };
  savingsStructure: BootstrapSavingsItem[];
  goals: BootstrapGoalItem[];
}

/**
 * Зеркало серверного пустого ответа — на случай null-envelope;
 * стабильная ссылка, чтобы structural sharing не плодил ререндеры.
 */
const EMPTY_BOOTSTRAP: UseBootstrapResponse = {
  profile: { startBalance: 0, currency: null, onboarded: false },
  onboarding: { categories: 0, reports: 0, operations: 0 },
  lastReport: null,
  globalTotals: { income: 0, expense: 0, savings: 0, daily: 0, accumulationsTotal: 0 },
  savingsStructure: [],
  goals: [],
};

export const bootstrapQueryKey = ['bootstrap'] as const;

export const useBootstrap = () =>
  useQuery<UseBootstrapResponse>({
    queryKey: bootstrapQueryKey,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseBootstrapResponse>('/users/me/bootstrap', { signal })) ?? EMPTY_BOOTSTRAP,
  });

/**
 * Инвалидация данных главной: вызывать в onSuccess/onSettled любой мутации,
 * меняющая цифры bootstrap-а (операции, периоды, накопления, цели, категории,
 * профиль). Отдельных ключей карточек больше нет — чиним одним вызовом.
 */
export const invalidateHomeCaches = (queryClient: QueryClient): void => {
  queryClient.invalidateQueries({ queryKey: bootstrapQueryKey });
};
