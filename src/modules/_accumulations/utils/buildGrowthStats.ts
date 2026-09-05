import type { ChartPoint, GrowthAggregation } from './buildGrowthChartData';

export interface MonthlyStats {
  abs: number;
  pct: number | null;
}

export interface YearlyStats {
  abs: number;
  pct: number | null;
  months: number;
}

export interface GrowthStats {
  monthly: MonthlyStats | null;
  yearly: YearlyStats | null;
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

  let absSum = 0;
  for (let i = 0; i < data.length - 1; i++) {
    absSum += data[i + 1].value - data[i].value;
  }
  const abs = absSum / (data.length - 1);

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

export const buildYearlyStats = (fullData: ChartPoint[]): YearlyStats | null => {
  if (fullData.length < 2) return null;

  const last = fullData[fullData.length - 1];
  const monthsAvailable = Math.min(fullData.length, 12);
  const first = fullData[fullData.length - monthsAvailable];

  const abs = last.value - first.value;
  const pct =
    first.value !== 0 && last.value !== 0 && Math.sign(first.value) === Math.sign(last.value)
      ? (last.value / first.value - 1) * 100
      : null;

  return { abs, pct, months: monthsAvailable };
};

export const buildGrowthStats = (
  filteredData: ChartPoint[],
  fullData: ChartPoint[],
  aggregation: GrowthAggregation = 'M',
): GrowthStats => ({
  monthly: buildMonthlyStats(filteredData),
  yearly: buildYearlyStats(fullData),
  periodLabel: AGGREGATION_LABELS[aggregation],
});
