import type { ChartPoint } from '@/modules/_accumulations/utils/buildGrowthChartData';

export type DynamicsChartMode = 'cumulative' | 'period';
export type DynamicsAggregation = 'D' | 'M' | 'Y';

// Одна строка на московские сутки, возвращаемая админской функцией БД.
export interface DynamicsDailyRow {
  day: string; // 'YYYY-MM-DD' — календарный день по времени Москвы
  operations_count: number;
}

// Метки времени приводятся к московскому календарному дню. МСК = UTC+3,
// переход на летнее время отменён с 2014 года, поэтому смещение постоянно.
export const MOSCOW_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;

// «Синтетическая» дата: полночь UTC, чьи UTC-поля равны московскому календарю.
export const moscowToday = (): Date => {
  const shifted = new Date(Date.now() + MOSCOW_UTC_OFFSET_MS);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()));
};

const toSyntheticDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

// 'YYYY-MM-DD' разбирается напрямую в синтетическую дату, без привязки к
// таймзоне браузера (SQL уже отдал московский календарный день).
const parseDay = (day: string): Date | null => {
  const parts = day.split('-');
  if (parts.length !== 3) return null;
  const [year, month, date] = parts.map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(date)) return null;
  return new Date(Date.UTC(year, month - 1, date));
};

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
  daily: DynamicsDailyRow[];
  aggregation: DynamicsAggregation;
  mode: DynamicsChartMode;
}

export const buildOperationsDynamicsData = ({
  daily,
  aggregation,
  mode,
}: BuildDynamicsDataArgs): ChartPoint[] => {
  if (daily.length === 0) return [];

  const counts = new Map<string, number>();
  let firstDay: Date | null = null;
  let lastDay: Date | null = null;

  for (const row of daily) {
    const date = parseDay(row.day);
    if (!date) continue;
    const key = getKey(date, aggregation);
    counts.set(key, (counts.get(key) ?? 0) + row.operations_count);
    if (!firstDay || date < firstDay) firstDay = date;
    if (!lastDay || date > lastDay) lastDay = date;
  }

  if (!firstDay || !lastDay) return [];

  // Границы серии выводятся из самих данных и доводятся до сегодняшнего дня:
  // иначе накопительный итог расходится с общим количеством операций в таблице.
  const today = moscowToday();
  const startDate = firstDay < today ? firstDay : today;
  const now = lastDay > today ? lastDay : today;

  const points: ChartPoint[] = [];
  let cumulative = 0;
  let cursor = startDate;

  while (cursor <= now) {
    const key = getKey(cursor, aggregation);
    const count = counts.get(key) ?? 0;
    cumulative += count;

    points.push({
      month: toSyntheticDay(cursor),
      label: getLabel(cursor, aggregation),
      value: mode === 'cumulative' ? cumulative : count,
    });

    cursor = getNext(cursor, aggregation);
  }

  return points;
};
