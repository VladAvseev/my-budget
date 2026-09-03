import type { Accumulation, Operation, Report } from '@/shared/supabase/types/domain';
import { sumOperations } from '@/modules/_overview/utils/overview';

export interface ChartPoint {
  month: Date;
  label: string;
  value: number;
}

export type GrowthChartType = 'accumulations' | 'capital';
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

const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const formatLabel = (date: Date): string =>
  `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, n: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + n, 1);

const totalAccumulations = (accumulations: Accumulation[]): number =>
  accumulations.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

export interface BuildGrowthChartDataArgs {
  reports: Report[];
  operationsByReport: Map<string, Operation[]>;
  accumulations: Accumulation[];
  startBalance: number;
  period: GrowthPeriod;
}

export const buildGrowthChartData = (
  args: BuildGrowthChartDataArgs,
  chartType: GrowthChartType,
): ChartPoint[] => {
  const { reports, operationsByReport, accumulations, startBalance, period } = args;

  if (reports.length === 0) return [];

  const reportsAsc = [...reports].sort(
    (a, b) => new Date(a.period_start).getTime() - new Date(b.period_start).getTime(),
  );

  const now = startOfMonth(new Date());
  const firstMonth = startOfMonth(new Date(reportsAsc[0].period_start));

  const reportSummaries = new Map<string, ReturnType<typeof sumOperations>>();
  for (const report of reportsAsc) {
    const operations = operationsByReport.get(report.id) ?? [];
    reportSummaries.set(monthKey(new Date(report.period_start)), sumOperations(operations));
  }

  const points: ChartPoint[] = [];
  let cumulativeValue = 0;
  const directTotal = totalAccumulations(accumulations);

  if (chartType === 'capital') {
    let firstReportFound = false;
    let cursor = firstMonth;
    while (cursor <= now) {
      const key = monthKey(cursor);
      const summary = reportSummaries.get(key);

      if (summary) {
        if (!firstReportFound) {
          cumulativeValue = startBalance + directTotal + summary.income - summary.expense - summary.daily;
          firstReportFound = true;
        } else {
          cumulativeValue += summary.income - summary.expense - summary.daily;
        }
      }

      points.push({
        month: new Date(cursor),
        label: formatLabel(cursor),
        value: firstReportFound ? cumulativeValue : startBalance + directTotal,
      });

      cursor = addMonths(cursor, 1);
    }
  } else {
    let cursor = firstMonth;
    while (cursor <= now) {
      const key = monthKey(cursor);
      const summary = reportSummaries.get(key);

      if (summary) {
        cumulativeValue += summary.savings;
      }

      points.push({
        month: new Date(cursor),
        label: formatLabel(cursor),
        value: directTotal + cumulativeValue,
      });

      cursor = addMonths(cursor, 1);
    }
  }

  if (period === 'all') return points;

  const cutoff = addMonths(now, -11);
  return points.filter((p) => p.month >= cutoff);
};
