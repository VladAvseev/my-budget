export interface ChartPoint {
  month: Date;
  label: string;
  value: number;
}

export const trimIncompletePeriod = (
  points: ChartPoint[],
  periodEnd: (start: Date) => Date,
  now: Date,
): ChartPoint[] => {
  if (points.length === 0) return points;
  const last = points[points.length - 1];
  return now < periodEnd(last.month) ? points.slice(0, -1) : points;
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
