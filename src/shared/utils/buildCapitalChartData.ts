import type { CapitalMonth } from '@/shared/api/hooks';
import type { ChartPoint } from '@/shared/utils/chartPoints';

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

const formatLabel = (date: Date): string =>
  `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

/** 'YYYY-MM' → первое число месяца в ЛОКАЛЬНОЙ зоне (без UTC-сдвига парсинга ISO). */
const parseMonth = (month: string): Date | null => {
  const [year, m] = month.split('-').map(Number);
  if (!year || !m || m < 1 || m > 12) return null;
  return new Date(year, m - 1, 1);
};

export interface BuildCapitalChartDataArgs {
  /** Дельты капитала по периодам из GET /reports/capital-dynamics (отсортированы по началу периода). */
  months: CapitalMonth[];
  /** База кривой: сумма initial_balance всех счетов. */
  base: number;
  /** Сегодня (переопределяется в ручных проверках границ). */
  now?: Date;
}

/**
 * Кумулятивный график капитала: первая точка — база (сумма стартовых балансов
 * всех счетов) + дельта первого периода, каждая следующая — предыдущая +
 * дельта следующего периода.
 *
 * Диапазон — от месяца первой точки (месяц первого периода точнее помесячный
 * эндпоинт не даёт) по текущий месяц включительно: дубли одного месяца
 * суммируются, месяцы без периодов наследуют последнее значение, будущие
 * месяцы отбрасываются.
 */
export const buildCapitalChartData = ({
  months,
  base,
  now = new Date(),
}: BuildCapitalChartDataArgs): ChartPoint[] => {
  const lastMonth = startOfMonth(now);

  const deltas = new Map<number, number>();
  for (const entry of months) {
    const cursor = parseMonth(entry.month);
    if (!cursor || cursor > lastMonth || !Number.isFinite(entry.delta)) continue;
    const key = cursor.getTime();
    deltas.set(key, (deltas.get(key) ?? 0) + entry.delta);
  }

  if (deltas.size === 0) return [];

  let cursor = new Date(Math.min(...deltas.keys()));

  const points: ChartPoint[] = [];
  let cumulativeValue = 0;
  while (cursor <= lastMonth) {
    cumulativeValue += deltas.get(cursor.getTime()) ?? 0;
    points.push({
      month: new Date(cursor),
      label: formatLabel(cursor),
      value: base + cumulativeValue,
    });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  return points;
};
