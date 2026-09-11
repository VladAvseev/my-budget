import type { AdminChartPoint, AdminLogsBucket } from '@/shared/api/types/admin';
import type { ChartPoint } from '@/shared/utils/chartPoints';

/**
 * Построение данных для графика «Количество логов» по МСК-часам/дням.
 *
 * Сервер (GET /admin/logs/dynamics) отдаёт только НЕПУСТЫЕ бакеты выбранной
 * гранулярности: 'YYYY-MM-DDTHH:00:00' для часов и 'YYYY-MM-DD' для суток
 * (wall-clock Москвы без смещения). Клиент достраивает пропущенные часы/дни
 * нулями, чтобы график был непрерывным.
 *
 * Для metric=unique_users сервер считает count(distinct user_id) уже на бакете;
 * клиент не агрегирует часы в сутки суммированием, иначе уникальные пользователи
 * за день были бы завышены.
 *
 * Точки синтетические: UTC-поля Date равны московскому календарю (тот же приём,
 * что в buildOperationsDynamicsData), поэтому отображение не зависит от таймзоны
 * браузера, а группировка по часам/дням — арифметикой над этими Date.
 */

export type LogsBucket = AdminLogsBucket;

export const MOSCOW_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// 'YYYY-MM-DDTHH:00:00' -> синтетическая дата (полный час), UTC-поля == МСК.
export const parseHourPoint = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):\d{2}:\d{2}$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour] = match.map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour));
};

// 'YYYY-MM-DD' -> синтетическая дата (полночь МСК-суток), UTC-поля == МСК.
export const parseDayPoint = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const parsePeriod = (value: string, bucket: LogsBucket): Date | null =>
  bucket === 'hour' ? parseHourPoint(value) : parseDayPoint(value);

// Текущий МСК-час как синтетическая дата (минуты/секунды обнулены).
export const moscowCurrentHour = (): Date => {
  const shifted = new Date(Date.now() + MOSCOW_UTC_OFFSET_MS);
  return new Date(
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
      shifted.getUTCHours(),
    ),
  );
};

// Текущие МСК-сутки как синтетическая дата (полночь).
export const moscowCurrentDay = (): Date => {
  const shifted = new Date(Date.now() + MOSCOW_UTC_OFFSET_MS);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()));
};

// Синтетическая дата -> полночь её МСК-суток.
const startOfDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const pad2 = (n: number): string => String(n).padStart(2, '0');

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

/**
 * Готовит ряд для графика по выбранному бакету и общий итог из ответа сервера.
 * Среднее и значение за последний бакет считает buildLogsDynamicsStats.
 */
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
