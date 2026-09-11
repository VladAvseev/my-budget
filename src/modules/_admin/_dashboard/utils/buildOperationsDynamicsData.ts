import type {
  AdminChartMetric,
  AdminChartPoint,
  AdminOperationsAggregation,
} from '@/shared/api/types/admin';
import type { ChartPoint } from '@/shared/utils/chartPoints';

export type DynamicsChartMode = 'cumulative' | 'period';
export type DynamicsAggregation = AdminOperationsAggregation;

// Метки времени приводятся к московскому календарному дню. МСК = UTC+3,
// переход на летнее время отменён с 2014 года, поэтому смещение постоянно.
export const MOSCOW_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;

// Дата запуска проекта: с неё начинается график роста и, соответственно,
// расчёт среднего роста. Операций с created_at раньше этой даты в базе нет
// (исторические данные мигрированы позже запуска).
export const DYNAMICS_START_DATE = '2026-07-31';

// «Синтетическая» дата: полночь UTC, чьи UTC-поля равны московскому календарю.
export const moscowToday = (): Date => {
  const shifted = new Date(Date.now() + MOSCOW_UTC_OFFSET_MS);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()));
};

const toSyntheticDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const parseNumbers = (parts: string[], expected: number): number[] | null => {
  if (parts.length !== expected) return null;
  const numbers = parts.map(Number);
  return numbers.every(Number.isFinite) ? numbers : null;
};

// Сервер отдаёт ключ периода в зависимости от aggregation: 'YYYY-MM-DD',
// 'YYYY-MM' или 'YYYY'. Разбираем напрямую в синтетическую дату, без привязки
// к таймзоне браузера (SQL уже считает границы в московском времени).
const parsePeriod = (period: string, aggregation: DynamicsAggregation): Date | null => {
  const parts = period.split('-');
  if (aggregation === 'D') {
    const [year, month, date] = parseNumbers(parts, 3) ?? [];
    return year === undefined || month === undefined || date === undefined
      ? null
      : new Date(Date.UTC(year, month - 1, date));
  }
  if (aggregation === 'M') {
    const [year, month] = parseNumbers(parts, 2) ?? [];
    return year === undefined || month === undefined ? null : new Date(Date.UTC(year, month - 1, 1));
  }
  const [year] = parseNumbers(parts, 1) ?? [];
  return year === undefined ? null : new Date(Date.UTC(year, 0, 1));
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
  points: AdminChartPoint[];
  aggregation: DynamicsAggregation;
  mode: DynamicsChartMode;
  metric: AdminChartMetric;
}

export const buildOperationsDynamicsData = ({
  points,
  aggregation,
  mode,
  metric,
}: BuildDynamicsDataArgs): ChartPoint[] => {
  if (points.length === 0) return [];

  const counts = new Map<string, number>();
  let lastDate: Date | null = null;

  for (const row of points) {
    const date = parsePeriod(row.period, aggregation);
    if (!date) continue;
    const key = getKey(date, aggregation);
    counts.set(key, (counts.get(key) ?? 0) + row.value);
    if (!lastDate || date > lastDate) lastDate = date;
  }

  if (!lastDate) return [];

  // Правый край доводим до сегодняшнего дня (или до последней даты, если данные
  // опережают «сегодня»): иначе накопительный итог расходится с общим
  // количеством операций в таблице.
  const today = moscowToday();
  const now = lastDate > today ? lastDate : today;
  // Левый край фиксирован — дата запуска: график и среднее роста всегда
  // считаются с 31.07.2026, даже если первые операции приходят позже (до
  // них серия идёт нулями). В будущее не уходим: если сегодня раньше
  // запуска, отсчитываем от сегодняшнего дня.
  const launch = parsePeriod(DYNAMICS_START_DATE, 'D');
  const startDate = launch && launch < now ? launch : now;

  // Накопление имеет смысл только для count: уникальных пользователей за
  // несколько периодов нельзя получить суммой точек, поэтому режим unique_users
  // всегда остаётся «За период».
  const cumulativeMode = mode === 'cumulative' && metric === 'count';

  const chartPoints: ChartPoint[] = [];
  let cumulative = 0;
  let cursor = startDate;

  while (cursor <= now) {
    const key = getKey(cursor, aggregation);
    const count = counts.get(key) ?? 0;
    cumulative += count;

    chartPoints.push({
      month: toSyntheticDay(cursor),
      label: getLabel(cursor, aggregation),
      value: cumulativeMode ? cumulative : count,
    });

    cursor = getNext(cursor, aggregation);
  }

  return chartPoints;
};
