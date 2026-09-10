import { useMemo, useState } from 'react';
import { useAccumulations, useProfile } from '@/shared/hooks';
import { convertAmount } from '@/shared/utils';
import {
  aggregatePoints,
  toPeriodDeltas,
  type ChartPoint,
  type GrowthAggregation,
} from '@/shared/utils/chartPoints';
import { VGrowthDynamicsCard } from '@/shared/ui/VGrowthDynamicsCard';
import commonStyles from '@/shared/styles/common.module.css';
import { useReports } from '../api/useReports';
import { useOverviewOperationsMap } from '../api/useOverviewOperationsMap';
import { buildCapitalChartData, type GrowthChartMode } from '../utils/buildCapitalChartData';
import { buildGrowthStats } from '../utils/buildGrowthStats';

export interface GrowthDynamicsCardCurrency {
  displayCurrency: string | null;
  defaultCurrency: string | null;
  rates?: Record<string, number> | null;
  displaySymbol?: string;
}

interface GrowthDynamicsCardProps {
  userId: string;
  title: string;
  currency: GrowthDynamicsCardCurrency;
}

const EMPTY_ARRAY: never[] = [];

export const GrowthDynamicsCard = ({ userId, title, currency }: GrowthDynamicsCardProps) => {
  const [mode, setMode] = useState<GrowthChartMode>('total');
  const [aggregation, setAggregation] = useState<GrowthAggregation>('M');

  const { displayCurrency, defaultCurrency, rates, displaySymbol } = currency;

  const reportsQuery = useReports();
  const accumulationsQuery = useAccumulations(userId);
  const profileQuery = useProfile();

  const reports = reportsQuery.data ?? EMPTY_ARRAY;
  const reportIds = useMemo(() => reports.map((r) => r.id), [reports]);
  const operationsQuery = useOverviewOperationsMap(reportIds);

  const startBalance = useMemo(
    () => Number(profileQuery.data?.start_balance ?? 0) || 0,
    [profileQuery.data],
  );

  const isLoading =
    reportsQuery.isLoading ||
    accumulationsQuery.isLoading ||
    profileQuery.isLoading ||
    operationsQuery.isLoading;

  const rawChartData = useMemo(
    () =>
      isLoading
        ? []
        : buildCapitalChartData({
            reports,
            operationsByReport: operationsQuery.data ?? new Map(),
            accumulations: accumulationsQuery.data ?? EMPTY_ARRAY,
            startBalance,
          }),
    [reports, operationsQuery.data, accumulationsQuery.data, startBalance, isLoading],
  );

  const convertedChartData = useMemo(() => {
    if (!displayCurrency || !rates || !defaultCurrency) return rawChartData;
    return rawChartData.map((point) => ({
      ...point,
      value: convertAmount(point.value, defaultCurrency, displayCurrency, rates),
    }));
  }, [rawChartData, displayCurrency, rates, defaultCurrency]);

  const rawBase = useMemo(() => {
    const directTotal = (accumulationsQuery.data ?? EMPTY_ARRAY).reduce(
      (sum, accumulation) => sum + (Number(accumulation.amount) || 0),
      0,
    );
    return startBalance + directTotal;
  }, [startBalance, accumulationsQuery.data]);

  const base = useMemo(() => {
    if (!displayCurrency || !rates || !defaultCurrency) return rawBase;
    return convertAmount(rawBase, defaultCurrency, displayCurrency, rates);
  }, [rawBase, displayCurrency, rates, defaultCurrency]);

  const chartData = useMemo(
    () => aggregatePoints(convertedChartData, aggregation),
    [convertedChartData, aggregation],
  );

  const displayData: ChartPoint[] = useMemo(
    () => (mode === 'period' ? toPeriodDeltas(chartData, base) : chartData),
    [chartData, base, mode],
  );

  const stats = useMemo(
    () => buildGrowthStats(chartData, aggregation, base, mode),
    [chartData, aggregation, base, mode],
  );

  return (
    <div className={commonStyles.animateCard} style={{ animationDelay: '0.12s' }}>
      <VGrowthDynamicsCard
        title={title}
        isLoading={isLoading}
        mode={mode}
        aggregation={aggregation}
        onModeChange={setMode}
        onAggregationChange={setAggregation}
        chartData={displayData}
        stats={stats}
        base={base}
        displaySymbol={displaySymbol}
      />
    </div>
  );
};
