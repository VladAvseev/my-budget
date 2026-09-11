import { isSavingsType, type OperationType } from '@/shared/api/types/domain';

export const operationsQueryKey = (reportId: string, type: OperationType) =>
  ['reports', reportId, 'operations', type] as const;

/** savings и savings_out забираются одним запросом — у них общий ключ кэша. */
export const savingsOperationsQueryType = 'savings,savings_out' as const;

export const savingsGroupQueryKey = (reportId: string) =>
  ['reports', reportId, 'operations', savingsOperationsQueryType] as const;

/** Ключ кэша операций для типа: обе savings-ветки лежат в одном запросе. */
export const operationsKeyForType = (reportId: string, type: OperationType) =>
  isSavingsType(type) ? savingsGroupQueryKey(reportId) : operationsQueryKey(reportId, type);

export const summaryQueryKey = (reportId: string) => ['reports', reportId, 'summary'] as const;
