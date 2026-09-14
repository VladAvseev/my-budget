import type { CapitalMonth } from '@/shared/api/hooks';
import type { ChartPoint } from '@/shared/utils/chartPoints';

export type GrowthChartMode = 'total' | 'period';

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
}

/**
 * Кумулятивный график капитала: первая точка — база (сумма стартовых балансов
 * всех счетов) + дельта первого периода, каждая следующая — предыдущая +
 * дельта следующего периода. Здесь остаётся только кумуляция и подписи.
 */
export const buildCapitalChartData = ({
  months,
  base,
}: BuildCapitalChartDataArgs): ChartPoint[] => {
  const now = startOfMonth(new Date());

  const points: ChartPoint[] = [];
  let cumulativeValue = 0;

  for (const entry of months) {
    const cursor = parseMonth(entry.month);
    if (!cursor || cursor > now) continue;

    cumulativeValue += entry.delta;
    points.push({
      month: cursor,
      label: formatLabel(cursor),
      value: base + cumulativeValue,
    });
  }

  return points;
};
