import { useMemo } from 'react';
import { useAccumulations, useProfile } from '@/shared/hooks';
import { useReports } from '../api/useReports';
import { useOverviewOperationsMap } from '../api/useOverviewOperationsMap';
import { getPeriodEnd, trimIncompletePeriod } from '@/shared/utils/chartPoints';
import { buildGrowthChartData } from '../utils/buildGrowthChartData';
import {
  buildWindowedMonthlyStats,
  buildMonthlyStats,
  RECENT_WINDOW_MONTHS,
} from '../utils/buildGrowthStats';

const EMPTY_ARRAY: never[] = [];

/**
 * Средний прирост накоплений в месяц — по последним 12 завершённым месяцам
 * (то же значение, что строка «В месяц (за последний год)» графика роста
 * накоплений); если завершённых месяцев не больше 12 — общее среднее.
 * Использует общие query-ключи с карточкой графика: данные берутся из кэша.
 */
export const useAverageMonthlyGrowth = (userId: string): number | null => {
  const reportsQuery = useReports();
  const accumulationsQuery = useAccumulations(userId);
  const profileQuery = useProfile();

  const reports = reportsQuery.data ?? EMPTY_ARRAY;
  const reportIds = useMemo(() => reports.map((r) => r.id), [reports]);
  const operationsQuery = useOverviewOperationsMap(reportIds);

  const isLoading =
    reportsQuery.isLoading ||
    accumulationsQuery.isLoading ||
    profileQuery.isLoading ||
    operationsQuery.isLoading;

  return useMemo(() => {
    if (isLoading) return null;

    const rawChartData = buildGrowthChartData({
      reports,
      operationsByReport: operationsQuery.data ?? new Map(),
      accumulations: accumulationsQuery.data ?? EMPTY_ARRAY,
      period: 'all',
    });

    const completed = trimIncompletePeriod(rawChartData, getPeriodEnd('M'), new Date());
    const windowed = buildWindowedMonthlyStats(completed, RECENT_WINDOW_MONTHS);
    return (windowed ?? buildMonthlyStats(completed))?.abs ?? null;
  }, [isLoading, reports, operationsQuery.data, accumulationsQuery.data]);
};
