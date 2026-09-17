import type {
  AdminAudience,
  AdminChartMetric,
  AdminOperationsAggregation,
} from '@/shared/api/types/admin';
import { atom } from 'jotai';
import type { DynamicsChartMode } from '../utils/buildOperationsDynamicsData';

export const operationsModeAtom = atom<DynamicsChartMode>('cumulative');
export const operationsAggregationAtom = atom<AdminOperationsAggregation>('D');
export const operationsAudienceAtom = atom<AdminAudience>('all');
export const operationsMetricAtom = atom<AdminChartMetric>('count');
