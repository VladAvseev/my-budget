import { api } from '@/shared/api/http';
import type { Operation } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/**
 * Карточка «Накопления» и страница накоплений: GET /operations/savings —
 * все пополнения/снятия с полями отчёта (серверный SavingsOperationDto;
 * reportName/reportPeriodStart — исторические camelCase-ключи ответа).
 * Хук общий: его кэш инвалидируют мутации из разных модулей.
 */
export type SavingsOperation = Operation & {
  reportName: string;
  reportPeriodStart: string;
};

export const savingsOperationsQueryKey = (userId: string) => ['savingsOperations', userId] as const;

/** Ответ GET /operations/savings. */
export type UseSavingsOperationsResponse = SavingsOperation[];

export const useSavingsOperations = (userId: string) =>
  useQuery<UseSavingsOperationsResponse>({
    queryKey: savingsOperationsQueryKey(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) =>
      (await api.get<UseSavingsOperationsResponse>('/operations/savings', { signal })) ?? [],
  });
