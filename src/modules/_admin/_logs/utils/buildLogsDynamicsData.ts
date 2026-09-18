import type { AdminChartPoint, AdminLogsBucket } from '@/shared/api/types/admin';
import type { ChartPoint } from '@/shared/utils/chartPoints';

export type LogsBucket = AdminLogsBucket;

// Часовой пояс отображения динамики. Сервер уже группирует бакеты в МСК
// (date_trunc(..., AT TIME ZONE 'Europe/Moscow')), периоды приходят как
// московский wall-clock без офсета и хранятся ниже в UTC-полях Date.
export const LOGS_TIME_ZONE = 'Europe/Moscow';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const parseHourPoint = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):\d{2}:\d{2}$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour] = match.map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour));
};

export const parseDayPoint = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const parsePeriod = (value: string, bucket: LogsBucket): Date | null =>
  bucket === 'hour' ? parseHourPoint(value) : parseDayPoint(value);

// Текущий московский час/день как wall-clock в UTC-полях Date.
// Через Intl с явным timeZone, а не ручным сдвигом +3: устойчиво к смене
// системной зоны браузера и к будущим изменениям смещения МСК.
const getMoscowParts = (
  now: Date,
): { year: number; month: number; day: number; hour: number } => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: LOGS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string): number => Number(parts.find((part) => part.type === type)?.value);
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour') };
};

export const moscowCurrentHour = (): Date => {
  const { year, month, day, hour } = getMoscowParts(new Date());
  return new Date(Date.UTC(year, month - 1, day, hour));
};

export const moscowCurrentDay = (): Date => {
  const { year, month, day } = getMoscowParts(new Date());
  return new Date(Date.UTC(year, month - 1, day));
};

const startOfDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const pad2 = (n: number): string => String(n).padStart(2, '0');

// Подписи оси — московское wall-clock время из UTC-полей Date (см. выше),
// поэтому getUTC*: при любом системном поясе браузера цифры остаются московскими.
const formatHourLabel = (date: Date): string =>
  `${pad2(date.getUTCDate())}.${pad2(date.getUTCMonth() + 1)} ${pad2(date.getUTCHours())}:00`;

const formatDayLabel = (date: Date): string =>
  `${pad2(date.getUTCDate())}.${pad2(date.getUTCMonth() + 1)}`;

const buildSeries = (
  counts: Map<number, number>,
  first: Date,
  now: Date,
  bucket: LogsBucket,
): ChartPoint[] => {
  const points: ChartPoint[] = [];
  const step = bucket === 'hour' ? HOUR_MS : DAY_MS;
  let cursor = bucket === 'hour' ? first.getTime() : startOfDay(first).getTime();
  const end = bucket === 'hour' ? now.getTime() : startOfDay(now).getTime();

  while (cursor <= end) {
    const date = new Date(cursor);
    points.push({
      month: date,
      label: bucket === 'hour' ? formatHourLabel(date) : formatDayLabel(date),
      value: counts.get(cursor) ?? 0,
    });
    cursor += step;
  }

  return points;
};

export interface BuildLogsDynamicsResult {
  chartData: ChartPoint[];
  total: number;
}

export const buildLogsDynamics = (
  points: AdminChartPoint[],
  bucket: LogsBucket,
  total: number,
): BuildLogsDynamicsResult => {
  if (points.length === 0) {
    return { chartData: [], total };
  }

  const counts = new Map<number, number>();
  let first: Date | null = null;
  let last: Date | null = null;

  for (const row of points) {
    const date = parsePeriod(row.period, bucket);
    if (!date) continue;
    const ts = date.getTime();
    counts.set(ts, (counts.get(ts) ?? 0) + row.value);
    if (!first || date < first) first = date;
    if (!last || date > last) last = date;
  }

  if (!first || !last) {
    return { chartData: [], total };
  }

  const now = bucket === 'hour' ? moscowCurrentHour() : moscowCurrentDay();
  const rightEdge = last > now ? last : now;

  return {
    chartData: buildSeries(counts, first, rightEdge, bucket),
    total,
  };
};
