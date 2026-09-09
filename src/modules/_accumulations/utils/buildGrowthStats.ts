import type { ChartPoint, GrowthAggregation, GrowthChartMode } from './buildGrowthChartData';
import {
  getPeriodEnd,
  getPointChange,
  trimIncompletePeriod,
  trimLeadingPartialPeriod,
  type PointChange,
} from './buildGrowthChartData';

export interface MonthlyStats {
  abs: number;
  pct: number | null;
}

export interface GrowthStats {
  monthly: MonthlyStats | null;
  recent: MonthlyStats | null;
  periodLabel: string;
  currentPeriod: PointChange | null;
  currentPeriodLabel: string;
}

// Окно «за последний год» из завершённых календарных месяцев: ровно один раз
// попадает каждый месяц, поэтому годовая сезонность компенсируется.
export const RECENT_WINDOW_MONTHS = 12;

const AGGREGATION_LABELS: Record<GrowthAggregation, string> = {
  M: 'В месяц',
  Q: 'В квартал',
  HY: 'В полугодие',
  Y: 'В год',
};

const CURRENT_PERIOD_LABELS: Record<GrowthAggregation, string> = {
  M: 'За текущий месяц',
  Q: 'За текущий квартал',
  HY: 'За текущее полугодие',
  Y: 'За текущий год',
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

/**
 * Средний прирост за последние `windowMonths` завершённых месяцев:
 * abs — рост внутри окна (базой служит точка перед окном, а не ноль),
 * pct — среднегеометрический рост по окну. null, если завершённых месяцев
 * не больше `windowMonths` (при равном окне строка дублировала бы общее).
 */
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

export const buildGrowthStats = (
  filteredData: ChartPoint[],
  aggregation: GrowthAggregation = 'M',
  base = 0,
  mode: GrowthChartMode = 'total',
): GrowthStats => {
  const now = new Date();
  const trimmed = trimLeadingPartialPeriod(
    trimIncompletePeriod(filteredData, getPeriodEnd(aggregation), now),
    aggregation,
  );

  // Строка «за последний год» считается только для помесячной группировки.
  const recent =
    aggregation === 'M' ? buildWindowedMonthlyStats(trimmed, RECENT_WINDOW_MONTHS) : null;

  if (mode === 'period') {
    return {
      monthly:
        trimmed.length > 0
          ? {
              abs: (trimmed[trimmed.length - 1].value - base) / trimmed.length,
              pct: null,
            }
          : null,
      recent:
        recent === null
          ? null
          : {
              abs: recent.abs,
              pct: null,
            },
      periodLabel: AGGREGATION_LABELS[aggregation],
      currentPeriod:
        filteredData.length > 0
          ? getPointChange(filteredData, filteredData.length - 1, base)
          : null,
      currentPeriodLabel: CURRENT_PERIOD_LABELS[aggregation],
    };
  }

  return {
    monthly: buildMonthlyStats(trimmed),
    recent,
    periodLabel: AGGREGATION_LABELS[aggregation],
    currentPeriod:
      filteredData.length > 0 ? getPointChange(filteredData, filteredData.length - 1, base) : null,
    currentPeriodLabel: CURRENT_PERIOD_LABELS[aggregation],
  };
};
