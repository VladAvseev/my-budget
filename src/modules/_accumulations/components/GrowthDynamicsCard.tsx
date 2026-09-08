import { useMemo, useState } from 'react';
import { useAccumulations, useProfile } from '@/shared/hooks';
import { convertAmount } from '@/shared/utils';
import { VCard } from '@/shared/ui/VCard';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VLoader } from '@/shared/ui/VLoader';
import commonStyles from '@/shared/styles/common.module.css';
import { useReports } from '../api/useReports';
import { useOverviewOperationsMap } from '../api/useOverviewOperationsMap';
import {
  buildGrowthChartData,
  aggregatePoints,
  toPeriodDeltas,
  type GrowthChartType,
  type GrowthChartMode,
  type GrowthAggregation,
} from '../utils/buildGrowthChartData';
import { buildGrowthStats } from '../utils/buildGrowthStats';
import { GrowthChart } from './GrowthChart';
import { GrowthStats } from './GrowthStats';
import styles from './GrowthDynamicsCard.module.css';

export interface GrowthDynamicsCardCurrency {
  displayCurrency: string | null;
  defaultCurrency: string | null;
  rates?: Record<string, number> | null;
  displaySymbol?: string;
}

interface GrowthDynamicsCardProps {
  userId: string;
  chartType: GrowthChartType;
  title: string;
  currency: GrowthDynamicsCardCurrency;
}

const EMPTY_ARRAY: never[] = [];

const modeOptions: VButtonGroupOption[] = [
  { value: 'total', label: 'Всего' },
  { value: 'period', label: 'За период' },
];

const aggregationOptions: VButtonGroupOption[] = [
  { value: 'M', label: 'мес' },
  { value: 'Q', label: 'кв' },
  { value: 'HY', label: 'пг' },
  { value: 'Y', label: 'год' },
];

const modeColors: Record<GrowthChartMode, string> = {
  total: 'var(--color-success)',
  period: 'var(--color-accent)',
};

export const GrowthDynamicsCard = ({
  userId,
  chartType,
  title,
  currency,
}: GrowthDynamicsCardProps) => {
  const [mode, setMode] = useState<GrowthChartMode>('total');
  const [aggregation, setAggregation] = useState<GrowthAggregation>('M');

  const { displayCurrency, defaultCurrency, rates, displaySymbol } = currency;

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

  const chartArgs = useMemo(
    () => ({
      reports,
      operationsByReport: operationsQuery.data ?? new Map(),
      accumulations: accumulationsQuery.data ?? EMPTY_ARRAY,
      startBalance: Number(profileQuery.data?.start_balance ?? 0) || 0,
    }),
    [reports, operationsQuery.data, accumulationsQuery.data, profileQuery.data],
  );

  const rawChartData = useMemo(
    () => (isLoading ? [] : buildGrowthChartData({ ...chartArgs, period: 'all' }, chartType)),
    [chartArgs, chartType, isLoading],
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
    return chartType === 'capital'
      ? (Number(profileQuery.data?.start_balance ?? 0) || 0) + directTotal
      : directTotal;
  }, [chartType, accumulationsQuery.data, profileQuery.data]);

  const base = useMemo(() => {
    if (!displayCurrency || !rates || !defaultCurrency) return rawBase;
    return convertAmount(rawBase, defaultCurrency, displayCurrency, rates);
  }, [rawBase, displayCurrency, rates, defaultCurrency]);

  const chartData = useMemo(
    () => aggregatePoints(convertedChartData, aggregation),
    [convertedChartData, aggregation],
  );

  const displayData = useMemo(
    () => (mode === 'period' ? toPeriodDeltas(chartData, base) : chartData),
    [chartData, base, mode],
  );

  const stats = useMemo(
    () => buildGrowthStats(chartData, aggregation, base, mode),
    [chartData, aggregation, base, mode],
  );

  return (
    <div className={commonStyles.animateCard} style={{ animationDelay: '0.12s' }}>
      <VCard className={styles.mobileCompact}>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
        </div>

        <div className={styles.controls}>
          <VButtonGroup options={modeOptions} value={mode} onChange={setMode} />
          <VButtonGroup
            options={aggregationOptions}
            value={aggregation}
            onChange={setAggregation}
          />
        </div>

        <GrowthStats stats={stats} displaySymbol={displaySymbol} />

        {isLoading ? (
          <div className={commonStyles.loaderContainer}>
            <VLoader />
          </div>
        ) : (
          <GrowthChart
            data={displayData}
            color={modeColors[mode]}
            showChange={mode === 'total'}
            displaySymbol={displaySymbol}
            base={base}
          />
        )}
      </VCard>
    </div>
  );
};
