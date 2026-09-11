import { useMemo } from 'react';
import { useAccumulations, useGrowthDynamics } from '@/shared/api/hooks';
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
 * Данные — из кэша общих ключей карточки графика (динамика + накопления).
 */
export const useAverageMonthlyGrowth = (userId: string): number | null => {
  const dynamicsQuery = useGrowthDynamics();
  const accumulationsQuery = useAccumulations(userId);

  const isLoading = dynamicsQuery.isLoading || accumulationsQuery.isLoading;

  return useMemo(() => {
    if (isLoading) return null;

    const rawChartData = buildGrowthChartData({
      months: dynamicsQuery.data ?? EMPTY_ARRAY,
      accumulations: accumulationsQuery.data ?? EMPTY_ARRAY,
      period: 'all',
    });

    const completed = trimIncompletePeriod(rawChartData, getPeriodEnd('M'), new Date());
    const windowed = buildWindowedMonthlyStats(completed, RECENT_WINDOW_MONTHS);
    return (windowed ?? buildMonthlyStats(completed))?.abs ?? null;
  }, [isLoading, dynamicsQuery.data, accumulationsQuery.data]);
};
