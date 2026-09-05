import { useMemo, useState } from 'react';
import { useAccumulations, useProfile } from '@/shared/hooks';
import { VCard } from '@/shared/ui/VCard';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VLoader } from '@/shared/ui/VLoader';
import commonStyles from '@/shared/styles/common.module.css';
import { useReports } from '../api/useReports';
import { useOverviewOperationsMap } from '../api/useOverviewOperationsMap';
import {
  buildGrowthChartData,
  aggregatePoints,
  type GrowthChartType,
  type GrowthAggregation,
} from '../utils/buildGrowthChartData';
import { buildGrowthStats } from '../utils/buildGrowthStats';
import { GrowthChart } from './GrowthChart';
import { GrowthStats } from './GrowthStats';
import styles from './GrowthChartsSection.module.css';

interface GrowthChartsSectionProps {
  userId: string;
}

const EMPTY_ARRAY: never[] = [];

const chartTypeOptions: VButtonGroupOption[] = [
  { value: 'capital', label: 'Капитал' },
  { value: 'accumulations', label: 'Накопления' },
];

const aggregationOptions: VButtonGroupOption[] = [
  { value: 'M', label: 'мес' },
  { value: 'Q', label: 'кв' },
  { value: 'HY', label: 'пг' },
  { value: 'Y', label: 'год' },
];

export const GrowthChartsSection = ({ userId }: GrowthChartsSectionProps) => {
  const [chartType, setChartType] = useState<GrowthChartType>('capital');
  const [aggregation, setAggregation] = useState<GrowthAggregation>('M');

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

  const chartData = useMemo(
    () => aggregatePoints(rawChartData, aggregation),
    [rawChartData, aggregation],
  );

  const stats = useMemo(
    () => buildGrowthStats(chartData, rawChartData, aggregation),
    [chartData, rawChartData, aggregation],
  );

  const color = chartType === 'accumulations' ? 'var(--color-accent)' : 'var(--color-success)';

  return (
    <div className={commonStyles.animateCard} style={{ animationDelay: '0.12s' }}>
      <VCard className={styles.mobileCompact}>
        <div className={styles.controls}>
          <VButtonGroup options={chartTypeOptions} value={chartType} onChange={setChartType} />
          <VButtonGroup options={aggregationOptions} value={aggregation} onChange={setAggregation} />
        </div>

        <GrowthStats stats={stats} />

        {isLoading ? (
          <div className={commonStyles.loaderContainer}>
            <VLoader />
          </div>
        ) : (
          <GrowthChart data={chartData} color={color} />
        )}
      </VCard>
    </div>
  );
};
