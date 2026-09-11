import type { Accumulation } from '@/shared/api/types/domain';
import type { GrowthMonth } from '@/shared/api/hooks';
import type { ChartPoint } from '@/shared/utils/chartPoints';

export type GrowthChartMode = 'total' | 'period';
export type GrowthPeriod = 'all' | 'year';

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

const addMonths = (date: Date, n: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + n, 1);

/** 'YYYY-MM' → первая числа месяца в ЛОКАЛЬНОЙ зоне (без UTC-сдвига парсинга ISO). */
const parseMonth = (month: string): Date | null => {
  const [year, m] = month.split('-').map(Number);
  if (!year || !m || m < 1 || m > 12) return null;
  return new Date(year, m - 1, 1);
};

const totalAccumulations = (accumulations: Accumulation[]): number =>
  accumulations.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

export interface BuildGrowthChartDataArgs {
  /** Помесячный нетто-прирост из GET /accumulations/dynamics (отсортирован по месяцам). */
  months: GrowthMonth[];
  accumulations: Accumulation[];
  period: GrowthPeriod;
}

/**
 * Кумулятивный график роста: база прямых накоплений + нарастающий итог
 * помесячного нетто-прироста. Месяцы-заполнители приходят с сервера, здесь
 * остаётся только кумуляция, форматирование подписей и отсечение «год».
 */
export const buildGrowthChartData = ({
  months,
  accumulations,
  period,
}: BuildGrowthChartDataArgs): ChartPoint[] => {
  const now = startOfMonth(new Date());
  const directTotal = totalAccumulations(accumulations);

  const points: ChartPoint[] = [];
  let cumulativeValue = 0;

  for (const entry of months) {
    const cursor = parseMonth(entry.month);
    if (!cursor || cursor > now) continue;

    cumulativeValue += entry.savings;
    points.push({
      month: cursor,
      label: formatLabel(cursor),
      value: directTotal + cumulativeValue,
    });
  }

  if (period === 'all') return points;

  const cutoff = addMonths(now, -11);
  return points.filter((p) => p.month >= cutoff);
};
