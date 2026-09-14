import type { ApiOperationType } from '@/shared/api/types/domain';

export const operationsQueryKey = (reportId: string, type: ApiOperationType) =>
  ['reports', reportId, 'operations', type] as const;

export const operationsKeyForType = operationsQueryKey;

export const summaryQueryKey = (reportId: string) => ['reports', reportId, 'summary'] as const;
