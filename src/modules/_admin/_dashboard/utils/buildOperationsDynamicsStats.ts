import type { ChartPoint } from '@/modules/_accumulations/utils/buildGrowthChartData';
import { trimIncompletePeriod } from '@/modules/_accumulations/utils/buildGrowthChartData';
import type { DynamicsAggregation, DynamicsChartMode } from './buildOperationsDynamicsData';

export interface DynamicsPeriodStats {
  abs: number;
}

export interface DynamicsStats {
  periodRate: DynamicsPeriodStats | null;
  lastPeriod: DynamicsPeriodStats | null;
  periodLabel: string;
  lastPeriodLabel: string;
}

const AGGREGATION_LABELS: Record<DynamicsAggregation, string> = {
  D: 'В день',
  M: 'В месяц',
  Y: 'В год',
};

const LAST_PERIOD_LABELS: Record<DynamicsAggregation, string> = {
  D: 'За последний день',
  M: 'За последний месяц',
  Y: 'За последний год',
};

const buildPeriodRate = (
  data: ChartPoint[],
  mode: DynamicsChartMode,
): DynamicsPeriodStats | null => {
  if (data.length === 0) return null;

  if (mode === 'period') {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i].value;
    }
    return { abs: sum / data.length };
  }

  return { abs: data[data.length - 1].value / data.length };
};

const buildLastPeriod = (
  data: ChartPoint[],
  mode: DynamicsChartMode,
): DynamicsPeriodStats | null => {
  if (data.length === 0) return null;

  if (mode === 'period') {
    return { abs: data[data.length - 1].value };
  }

  if (data.length === 1) return { abs: data[0].value };
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  return { abs: last.value - prev.value };
};

const getPeriodEnd = (aggregation: DynamicsAggregation) => (start: Date): Date => {
  const end = new Date(start);
  if (aggregation === 'D') end.setUTCDate(end.getUTCDate() + 1);
  else if (aggregation === 'M') end.setUTCMonth(end.getUTCMonth() + 1);
  else end.setUTCFullYear(end.getUTCFullYear() + 1);
  return end;
};

export const buildOperationsDynamicsStats = (
  data: ChartPoint[],
  aggregation: DynamicsAggregation,
  mode: DynamicsChartMode,
): DynamicsStats => ({
  periodRate: buildPeriodRate(
    trimIncompletePeriod(data, getPeriodEnd(aggregation), new Date()),
    mode,
  ),
  lastPeriod: buildLastPeriod(data, mode),
  periodLabel: AGGREGATION_LABELS[aggregation],
  lastPeriodLabel: LAST_PERIOD_LABELS[aggregation],
});
