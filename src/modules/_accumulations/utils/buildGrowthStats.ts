import type { ChartPoint, GrowthAggregation } from './buildGrowthChartData';
import { getPeriodEnd, trimIncompletePeriod } from './buildGrowthChartData';

export interface MonthlyStats {
  abs: number;
  pct: number | null;
}

export interface GrowthStats {
  monthly: MonthlyStats | null;
  periodLabel: string;
}

const AGGREGATION_LABELS: Record<GrowthAggregation, string> = {
  M: 'В месяц',
  Q: 'В квартал',
  HY: 'В полугодие',
  Y: 'В год',
};

export const buildMonthlyStats = (data: ChartPoint[]): MonthlyStats | null => {
  if (data.length < 2) return null;

  let absSum = data[0].value;
  for (let i = 1; i < data.length; i++) {
    absSum += data[i].value - data[i - 1].value;
  }
  const abs = absSum / data.length;

  let firstIndex = -1;
  let firstValue = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].value !== 0) {
      firstIndex = i;
      firstValue = data[i].value;
      break;
    }
  }

  const lastValue = data[data.length - 1].value;
  const lastIndex = data.length - 1;
  const months = lastIndex - firstIndex;

  if (
    firstIndex === -1 ||
    months <= 0 ||
    firstValue === 0 ||
    lastValue === 0 ||
    Math.sign(firstValue) !== Math.sign(lastValue)
  ) {
    return { abs, pct: null };
  }

  const pct = (Math.pow(lastValue / firstValue, 1 / months) - 1) * 100;

  return { abs, pct };
};

export const buildGrowthStats = (
  filteredData: ChartPoint[],
  aggregation: GrowthAggregation = 'M',
): GrowthStats => {
  const now = new Date();

  return {
    monthly: buildMonthlyStats(trimIncompletePeriod(filteredData, getPeriodEnd(aggregation), now)),
    periodLabel: AGGREGATION_LABELS[aggregation],
  };
};
