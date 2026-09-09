import type { Accumulation, Operation, Report } from '@/shared/api/types/domain';
import { sumOperations } from '@/modules/_overview/utils/overview';

export interface ChartPoint {
  month: Date;
  label: string;
  value: number;
}

export type GrowthChartType = 'accumulations' | 'capital';
export type GrowthChartMode = 'total' | 'period';
export type GrowthPeriod = 'all' | 'year';
export type GrowthAggregation = 'M' | 'Q' | 'HY' | 'Y';

const MONTH_LABELS = [
  'Янв',
  'Фев',
  'Мар',
  'Апр',
  'Май',
  'Июн',
  'Июл',
  'Авг',
  'Сен',
  'Окт',
  'Ноя',
  'Дек',
];

const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const formatLabel = (date: Date): string =>
  `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, n: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + n, 1);

const totalAccumulations = (accumulations: Accumulation[]): number =>
  accumulations.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

export interface BuildGrowthChartDataArgs {
  reports: Report[];
  operationsByReport: Map<string, Operation[]>;
  accumulations: Accumulation[];
  startBalance: number;
  period: GrowthPeriod;
}

export const buildGrowthChartData = (
  args: BuildGrowthChartDataArgs,
  chartType: GrowthChartType,
): ChartPoint[] => {
  const { reports, operationsByReport, accumulations, startBalance, period } = args;

  if (reports.length === 0) return [];

  const reportsAsc = [...reports].sort(
    (a, b) => new Date(a.period_start).getTime() - new Date(b.period_start).getTime(),
  );

  const now = startOfMonth(new Date());
  const firstMonth = startOfMonth(new Date(reportsAsc[0].period_start));

  const reportSummaries = new Map<string, ReturnType<typeof sumOperations>>();
  for (const report of reportsAsc) {
    const operations = operationsByReport.get(report.id) ?? [];
    reportSummaries.set(monthKey(new Date(report.period_start)), sumOperations(operations));
  }

  const points: ChartPoint[] = [];
  let cumulativeValue = 0;
  const directTotal = totalAccumulations(accumulations);

  if (chartType === 'capital') {
    let firstReportFound = false;
    let cursor = firstMonth;
    while (cursor <= now) {
      const key = monthKey(cursor);
      const summary = reportSummaries.get(key);

      if (summary) {
        if (!firstReportFound) {
          cumulativeValue =
            startBalance + directTotal + summary.income - summary.expense - summary.daily;
          firstReportFound = true;
        } else {
          cumulativeValue += summary.income - summary.expense - summary.daily;
        }
      }

      points.push({
        month: new Date(cursor),
        label: formatLabel(cursor),
        value: firstReportFound ? cumulativeValue : startBalance + directTotal,
      });

      cursor = addMonths(cursor, 1);
    }
  } else {
    let cursor = firstMonth;
    while (cursor <= now) {
      const key = monthKey(cursor);
      const summary = reportSummaries.get(key);

      if (summary) {
        cumulativeValue += summary.savings;
      }

      points.push({
        month: new Date(cursor),
        label: formatLabel(cursor),
        value: directTotal + cumulativeValue,
      });

      cursor = addMonths(cursor, 1);
    }
  }

  if (period === 'all') return points;

  const cutoff = addMonths(now, -11);
  return points.filter((p) => p.month >= cutoff);
};

const AGGREGATION_SIZE: Record<GrowthAggregation, number> = { M: 1, Q: 3, HY: 6, Y: 12 };

export const getPeriodEnd =
  (aggregation: GrowthAggregation) =>
  (start: Date): Date =>
    addMonths(start, AGGREGATION_SIZE[aggregation]);

export const trimIncompletePeriod = (
  points: ChartPoint[],
  periodEnd: (start: Date) => Date,
  now: Date,
): ChartPoint[] => {
  if (points.length === 0) return points;
  const last = points[points.length - 1];
  return now < periodEnd(last.month) ? points.slice(0, -1) : points;
};

// Первый агрегированный период неполный, если серия начинается не с первого
// календарного месяца своего периода (для кв/пг/год): прирост в нём занижен.
export const trimLeadingPartialPeriod = (
  points: ChartPoint[],
  aggregation: GrowthAggregation,
): ChartPoint[] => {
  if (aggregation === 'M' || points.length === 0) return points;
  const size = AGGREGATION_SIZE[aggregation];
  return points[0].month.getMonth() % size !== 0 ? points.slice(1) : points;
};

export interface PointChange {
  abs: number;
  pct: number | null;
}

export const getPointChange = (data: ChartPoint[], index: number, base = 0): PointChange | null => {
  if (index < 0 || index >= data.length) return null;

  const value = data[index].value;
  const previousValue = index === 0 ? base : data[index - 1].value;
  const abs = value - previousValue;

  const pct = previousValue > 0 ? (value / previousValue - 1) * 100 : null;

  return { abs, pct };
};

export const toPeriodDeltas = (points: ChartPoint[], base = 0): ChartPoint[] =>
  points.map((point, index) => ({
    month: point.month,
    label: point.label,
    value: index === 0 ? point.value - base : point.value - points[index - 1].value,
  }));

const QUARTER_LABELS = ['1 кв', '2 кв', '3 кв', '4 кв'];
const HALF_LABELS = ['1 пол', '2 пол'];

const periodLabel = (aggregation: GrowthAggregation, year: number, periodIndex: number): string => {
  if (aggregation === 'Q') return `${QUARTER_LABELS[periodIndex]} ${year}`;
  if (aggregation === 'HY') return `${HALF_LABELS[periodIndex]} ${year}`;
  return `${year} год`;
};

export const aggregatePoints = (
  points: ChartPoint[],
  aggregation: GrowthAggregation,
): ChartPoint[] => {
  if (aggregation === 'M' || points.length === 0) return points;

  const size = AGGREGATION_SIZE[aggregation];

  const groups: { year: number; periodIndex: number; points: ChartPoint[] }[] = [];

  for (const point of points) {
    const year = point.month.getFullYear();
    const periodIndex = Math.floor(point.month.getMonth() / size);

    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.year === year && lastGroup.periodIndex === periodIndex) {
      lastGroup.points.push(point);
    } else {
      groups.push({ year, periodIndex, points: [point] });
    }
  }

  return groups.map((group) => ({
    month: group.points[0].month,
    label: periodLabel(aggregation, group.year, group.periodIndex),
    value: group.points[group.points.length - 1].value,
  }));
};
