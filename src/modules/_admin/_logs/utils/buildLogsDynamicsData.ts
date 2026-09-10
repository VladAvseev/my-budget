import type { AdminLogsDynamicsPoint } from '@/shared/api/types/domain';
import type { ChartPoint } from '@/shared/utils/chartPoints';

/**
 * Построение данных для графика «Количество логов» по МСК-часам/дням.
 *
 * Сервер (GET /admin/logs/dynamics) отдаёт только НЕПУСТЫЕ МСК-часы
 * ('YYYY-MM-DDTHH:00:00' — wall-clock Москвы без смещения). Клиент:
 *   * достраивает пропущенные часы/дни нулями (правый край — текущий МСК-час /
 *     текущие МСК-сутки), чтобы график был непрерывным;
 *   * для режима «День» агрегирует часы в сутки;
 *   * считает средние и значения за последний час/день (см. buildLogsDynamicsStats).
 *
 * Точки синтетические: UTC-поля Date равны московскому календарю (тот же приём,
 * что в buildOperationsDynamicsData), поэтому отображение не зависит от таймзоны
 * браузера, а группировка по часам/дням — арифметикой над этими Date.
 */

export type LogsBucket = 'hour' | 'day';

export const MOSCOW_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

// 'YYYY-MM-DDTHH:00:00' -> синтетическая дата (полный час), UTC-поля == МСК.
export const parseHourPoint = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):\d{2}:\d{2}$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour] = match.map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour));
};

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

// Синтетическая дата -> полночь её МСК-суток (для группировки по дням).
const startOfDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const pad2 = (n: number): string => String(n).padStart(2, '0');

const formatHourLabel = (date: Date): string =>
  `${pad2(date.getUTCDate())}.${pad2(date.getUTCMonth() + 1)} ${pad2(date.getUTCHours())}:00`;

const formatDayLabel = (date: Date): string =>
  `${pad2(date.getUTCDate())}.${pad2(date.getUTCMonth() + 1)}`;

/** Непрерывный ряд часов от первой точки до текущего МСК-часа (пустые = 0). */
const buildHourSeries = (counts: Map<number, number>, first: Date, now: Date): ChartPoint[] => {
  const points: ChartPoint[] = [];
  let cursor = first.getTime();
  const end = now.getTime();
  while (cursor <= end) {
    const date = new Date(cursor);
    points.push({
      month: date,
      label: formatHourLabel(date),
      value: counts.get(cursor) ?? 0,
    });
    cursor += HOUR_MS;
  }
  return points;
};

/** Агрегация часов в сутки: суммарные логи на каждый МСК-календарный день. */
const buildDaySeries = (counts: Map<number, number>, first: Date, now: Date): ChartPoint[] => {
  const daily = new Map<number, number>();
  for (const [hourTs, count] of counts) {
    const dayTs = startOfDay(new Date(hourTs)).getTime();
    daily.set(dayTs, (daily.get(dayTs) ?? 0) + count);
  }
  const points: ChartPoint[] = [];
  let cursor = startOfDay(first).getTime();
  const end = startOfDay(now).getTime();
  while (cursor <= end) {
    const date = new Date(cursor);
    points.push({ month: date, label: formatDayLabel(date), value: daily.get(cursor) ?? 0 });
    cursor = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1),
    ).getTime();
  }
  return points;
};

export interface BuildLogsDynamicsResult {
  chartData: ChartPoint[];
  hourSeries: ChartPoint[];
  daySeries: ChartPoint[];
  total: number;
}

/**
 * Готовит три вещи разом: ряд для графика (выбранный bucket), полные часовый и
 * суточный ряды (для статистики средних/последнего периода) и общий итог.
 */
export const buildLogsDynamics = (
  points: AdminLogsDynamicsPoint[],
  bucket: LogsBucket,
): BuildLogsDynamicsResult => {
  if (points.length === 0) {
    return { chartData: [], hourSeries: [], daySeries: [], total: 0 };
  }

  const counts = new Map<number, number>();
  let first: Date | null = null;
  let total = 0;
  for (const row of points) {
    const date = parseHourPoint(row.hour);
    if (!date) continue;
    const ts = date.getTime();
    counts.set(ts, (counts.get(ts) ?? 0) + row.count);
    total += row.count;
    if (!first || date < first) first = date;
  }
  if (!first) {
    return { chartData: [], hourSeries: [], daySeries: [], total: 0 };
  }

  const now = moscowCurrentHour();
  const hourSeries = buildHourSeries(counts, first, now);
  const daySeries = buildDaySeries(counts, first, now);

  return {
    chartData: bucket === 'hour' ? hourSeries : daySeries,
    hourSeries,
    daySeries,
    total,
  };
};
