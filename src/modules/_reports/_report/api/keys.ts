import type { OperationType } from '@/shared/supabase/types/domain';

export const operationsQueryKey = (reportId: string, type: OperationType) =>
  ['reports', reportId, 'operations', type] as const;

export const summaryQueryKey = (reportId: string) => ['reports', reportId, 'summary'] as const;