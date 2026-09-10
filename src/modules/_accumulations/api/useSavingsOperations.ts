import { api } from '@/shared/api/http';
import type { Operation } from '@/shared/api/types/domain';
import { useQuery } from '@tanstack/react-query';

/**
 * GET /operations/savings — все пополнения и снятия с полями отчёта;
 * reportName/reportPeriodStart — исторические camelCase-ключи ответа.
 */
export type SavingsOperation = Operation & { reportName: string; reportPeriodStart: string };

export const useSavingsOperations = (userId: string) =>
  useQuery<SavingsOperation[]>({
    queryKey: ['savingsOperations', userId],
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => (await api.get<SavingsOperation[]>('/operations/savings')) ?? [],
  });
