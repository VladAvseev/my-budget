export interface ChartPoint {
  month: Date;
  label: string;
  value: number;
}

export type GrowthAggregation = 'M' | 'Q' | 'HY' | 'Y';

const AGGREGATION_SIZE: Record<GrowthAggregation, number> = { M: 1, Q: 3, HY: 6, Y: 12 };

export const getPeriodEnd =
  (aggregation: GrowthAggregation) =>
  (start: Date): Date =>
    new Date(start.getFullYear(), start.getMonth() + AGGREGATION_SIZE[aggregation], 1);

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
