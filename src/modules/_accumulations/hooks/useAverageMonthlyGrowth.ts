import { useMemo } from 'react';
import { useAccumulations, useProfile } from '@/shared/hooks';
import { useReports } from '../api/useReports';
import { useOverviewOperationsMap } from '../api/useOverviewOperationsMap';
import {
  buildGrowthChartData,
  getPeriodEnd,
  trimIncompletePeriod,
} from '../utils/buildGrowthChartData';
import { buildMonthlyStats } from '../utils/buildGrowthStats';

const EMPTY_ARRAY: never[] = [];

/**
 * Средний прирост накоплений в месяц (по завершённым месяцам) —
 * то же значение, что статка «В месяц» графика роста накоплений.
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

    const rawChartData = buildGrowthChartData(
      {
        reports,
        operationsByReport: operationsQuery.data ?? new Map(),
        accumulations: accumulationsQuery.data ?? EMPTY_ARRAY,
        startBalance: Number(profileQuery.data?.start_balance ?? 0) || 0,
        period: 'all',
      },
      'accumulations',
    );

    const completed = trimIncompletePeriod(rawChartData, getPeriodEnd('M'), new Date());
    return buildMonthlyStats(completed)?.abs ?? null;
  }, [isLoading, reports, operationsQuery.data, accumulationsQuery.data, profileQuery.data]);
};
