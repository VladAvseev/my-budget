import type { ApiOperationType } from '@/shared/api/types/domain';

export const operationsQueryKey = (month: string, type: ApiOperationType) =>
  ['operations', 'by-months', month, type] as const;

export const operationsKeyForType = operationsQueryKey;

export const monthSummaryQueryKey = (month: string) =>
  ['operations', 'category-summary', month] as const;
