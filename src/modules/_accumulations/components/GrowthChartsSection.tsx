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
  type GrowthChartType,
  type GrowthPeriod,
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

const periodOptions: VButtonGroupOption[] = [
  { value: 'all', label: 'Все время' },
  { value: 'year', label: 'Год' },
];

export const GrowthChartsSection = ({ userId }: GrowthChartsSectionProps) => {
  const [chartType, setChartType] = useState<GrowthChartType>('capital');
  const [period, setPeriod] = useState<GrowthPeriod>('all');

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

  const chartData = useMemo(
    () => (isLoading ? [] : buildGrowthChartData({ ...chartArgs, period }, chartType)),
    [chartArgs, period, chartType, isLoading],
  );

  const fullData = useMemo(
    () => (isLoading ? [] : buildGrowthChartData({ ...chartArgs, period: 'all' }, chartType)),
    [chartArgs, chartType, isLoading],
  );

  const stats = useMemo(() => buildGrowthStats(chartData, fullData), [chartData, fullData]);

  const color = chartType === 'accumulations' ? 'var(--color-accent)' : 'var(--color-success)';

  return (
    <div className={commonStyles.animateCard} style={{ animationDelay: '0.12s' }}>
      <VCard>
        <div className={styles.controls}>
          <VButtonGroup options={chartTypeOptions} value={chartType} onChange={setChartType} />
          <VButtonGroup options={periodOptions} value={period} onChange={setPeriod} />
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
