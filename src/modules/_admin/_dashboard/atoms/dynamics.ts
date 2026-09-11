import type {
  AdminAudience,
  AdminChartMetric,
  AdminOperationsAggregation,
} from '@/shared/api/types/admin';
import { atom } from 'jotai';
import type { DynamicsChartMode } from '../utils/buildOperationsDynamicsData';

/**
 * Фильтры графика динамики операций: живут в атомах, а не в useState карточки,
 * чтобы выбор переживал переход на другую вкладку админки и обратно.
 * Персистентность не нужна — это сеансовый выбор.
 */
export const operationsModeAtom = atom<DynamicsChartMode>('cumulative');
export const operationsAggregationAtom = atom<AdminOperationsAggregation>('D');
export const operationsAudienceAtom = atom<AdminAudience>('all');
export const operationsMetricAtom = atom<AdminChartMetric>('count');
