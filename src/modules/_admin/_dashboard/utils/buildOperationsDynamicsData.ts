import type { ChartPoint } from '@/modules/_accumulations/utils/buildGrowthChartData';

export type DynamicsChartMode = 'cumulative' | 'period';
export type DynamicsAggregation = 'D' | 'M' | 'Y';

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

const pad2 = (n: number): string => String(n).padStart(2, '0');

const dayKey = (date: Date): string =>
  `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;

const monthKey = (date: Date): string => `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}`;

const yearKey = (date: Date): string => `${date.getUTCFullYear()}`;

const formatDayLabel = (date: Date): string =>
  `${pad2(date.getUTCDate())}.${pad2(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}`;

const formatMonthLabel = (date: Date): string =>
  `${MONTH_LABELS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;

const formatYearLabel = (date: Date): string => `${date.getUTCFullYear()} год`;

const toUTCDate = (iso: string): Date => {
  const d = new Date(iso);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const startOfDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const addDays = (date: Date, n: number): Date => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
};

const addMonths = (date: Date, n: number): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + n, 1));

const addYears = (date: Date, n: number): Date =>
  new Date(Date.UTC(date.getUTCFullYear() + n, 0, 1));

const getKey = (date: Date, aggregation: DynamicsAggregation): string => {
  if (aggregation === 'D') return dayKey(date);
  if (aggregation === 'M') return monthKey(date);
  return yearKey(date);
};

const getLabel = (date: Date, aggregation: DynamicsAggregation): string => {
  if (aggregation === 'D') return formatDayLabel(date);
  if (aggregation === 'M') return formatMonthLabel(date);
  return formatYearLabel(date);
};

const getNext = (date: Date, aggregation: DynamicsAggregation): Date => {
  if (aggregation === 'D') return addDays(date, 1);
  if (aggregation === 'M') return addMonths(date, 1);
  return addYears(date, 1);
};

export interface BuildDynamicsDataArgs {
  operations: { created_at: string }[];
  aggregation: DynamicsAggregation;
  mode: DynamicsChartMode;
}

export const buildOperationsDynamicsData = ({
  operations,
  aggregation,
  mode,
}: BuildDynamicsDataArgs): ChartPoint[] => {
  if (operations.length === 0) return [];

  const startDate = new Date(Date.UTC(2026, 6, 31));
  const now = startOfDay(new Date());

  const counts = new Map<string, number>();
  for (const op of operations) {
    const date = toUTCDate(op.created_at);
    const key = getKey(date, aggregation);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const points: ChartPoint[] = [];
  let cumulative = 0;
  let cursor = startDate;

  while (cursor <= now) {
    const key = getKey(cursor, aggregation);
    const count = counts.get(key) ?? 0;
    cumulative += count;

    points.push({
      month: new Date(cursor),
      label: getLabel(cursor, aggregation),
      value: mode === 'cumulative' ? cumulative : count,
    });

    cursor = getNext(cursor, aggregation);
  }

  return points;
};
