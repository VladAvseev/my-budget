import type { VGrowthStatsData } from '@/shared/ui/VGrowthDynamicsCard';
import type { ChartPoint, GrowthAggregation } from '@/shared/utils/chartPoints';
import {
  getPeriodEnd,
  getPointChange,
  trimIncompletePeriod,
  trimLeadingPartialPeriod,
} from '@/shared/utils/chartPoints';

export interface MonthlyStats {
  abs: number;
  pct: number | null;
}

export const RECENT_WINDOW_MONTHS = 12;

const AGGREGATION_LABELS: Record<GrowthAggregation, string> = {
  M: 'В месяц',
  Q: 'В квартал',
  HY: 'В полугодие',
  Y: 'В год',
};

const CURRENT_PERIOD_LABELS: Record<GrowthAggregation, string> = {
  M: 'За этот месяц',
  Q: 'За этот квартал',
  HY: 'За это полугодие',
  Y: 'За этот год',
};

export const buildMonthlyStats = (data: ChartPoint[], base = 0): MonthlyStats | null => {
  if (data.length === 0) return null;

  let absSum = data[0].value - base;
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

export const buildWindowedMonthlyStats = (
  data: ChartPoint[],
  windowMonths: number,
): MonthlyStats | null => {
  if (data.length < windowMonths + 1) return null;

  const window = data.slice(data.length - windowMonths);
  const baseValue = data[data.length - windowMonths - 1].value;
  const lastValue = window[window.length - 1].value;
  const abs = (lastValue - baseValue) / windowMonths;

  let firstIndex = -1;
  let firstValue = 0;
  for (let i = 0; i < window.length; i++) {
    if (window[i].value !== 0) {
      firstIndex = i;
      firstValue = window[i].value;
      break;
    }
  }

  const months = window.length - 1 - firstIndex;

  if (
    firstIndex === -1 ||
    months <= 0 ||
    lastValue === 0 ||
    Math.sign(firstValue) !== Math.sign(lastValue)
  ) {
    return { abs, pct: null };
  }

  const pct = (Math.pow(lastValue / firstValue, 1 / months) - 1) * 100;

  return { abs, pct };
};

export interface BuildGrowthStatsOptions {

  firstActivityDate?: Date | null;

  now?: Date;
}

export const buildRecentMonthlyGrowth = (
  data: ChartPoint[],
  base = 0,
  options: BuildGrowthStatsOptions = {},
): { avg: number | null; months: number } => {
  const completed = trimLeadingPartialPeriod(
    trimIncompletePeriod(data, getPeriodEnd('M'), options.now ?? new Date()),
    'M',
    options.firstActivityDate,
  ).slice(-RECENT_WINDOW_MONTHS);
  if (!completed.length) return { avg: null, months: 0 };
  const firstIndex = data.indexOf(completed[0]);
  const previous = firstIndex > 0 ? data[firstIndex - 1].value : base;
  return {
    avg: (completed[completed.length - 1].value - previous) / completed.length,
    months: completed.length,
  };
};

export const buildGrowthStats = (
  filteredData: ChartPoint[],
  aggregation: GrowthAggregation = 'M',
  base = 0,
  options: BuildGrowthStatsOptions = {},
): VGrowthStatsData => {
  const now = options.now ?? new Date();

  const trimmed = trimLeadingPartialPeriod(
    trimIncompletePeriod(filteredData, getPeriodEnd(aggregation), now),
    aggregation,
    options.firstActivityDate,
  );

  const firstIndex = trimmed.length ? filteredData.indexOf(trimmed[0]) : 0;
  const trimmedBase = firstIndex > 0 ? filteredData[firstIndex - 1].value : base;

  const recent =
    aggregation === 'M' && trimmed.length > RECENT_WINDOW_MONTHS
      ? {
          abs: buildRecentMonthlyGrowth(filteredData, base, options).avg!,
          pct: buildWindowedMonthlyStats(trimmed, RECENT_WINDOW_MONTHS)?.pct ?? null,
        }
      : null;

  return {
    monthly: buildMonthlyStats(trimmed, trimmedBase),
    recent,
    periodLabel: AGGREGATION_LABELS[aggregation],
    currentPeriod:
      filteredData.length > 0 ? getPointChange(filteredData, filteredData.length - 1, base) : null,
    currentPeriodLabel: CURRENT_PERIOD_LABELS[aggregation],
  };
};
