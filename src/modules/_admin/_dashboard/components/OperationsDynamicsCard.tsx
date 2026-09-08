import { useMemo, useState } from 'react';
import { VCard } from '@/shared/ui/VCard';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VLoader } from '@/shared/ui/VLoader';
import { GrowthChart } from '@/modules/_accumulations/components/GrowthChart';
import { useAdminOperationsDynamics } from '../api/useAdminOperationsDynamics';
import {
  buildOperationsDynamicsData,
  type DynamicsChartMode,
  type DynamicsAggregation,
} from '../utils/buildOperationsDynamicsData';
import { buildOperationsDynamicsStats } from '../utils/buildOperationsDynamicsStats';
import { OperationsDynamicsStats } from './OperationsDynamicsStats';
import styles from './OperationsDynamicsCard.module.css';

const modeOptions: VButtonGroupOption[] = [
  { value: 'cumulative', label: 'Всего' },
  { value: 'period', label: 'За период' },
];

const aggregationOptions: VButtonGroupOption[] = [
  { value: 'D', label: 'День' },
  { value: 'M', label: 'Месяц' },
  { value: 'Y', label: 'Год' },
];

const formatCount = (v: number): string => Math.round(v).toLocaleString('ru-RU');

export const OperationsDynamicsCard = () => {
  const [mode, setMode] = useState<DynamicsChartMode>('cumulative');
  const [aggregation, setAggregation] = useState<DynamicsAggregation>('D');
  const operationsQuery = useAdminOperationsDynamics();

  const isLoading = operationsQuery.isLoading;

  const chartData = useMemo(
    () =>
      isLoading
        ? []
        : buildOperationsDynamicsData({
            daily: operationsQuery.data ?? [],
            aggregation,
            mode,
          }),
    [operationsQuery.data, aggregation, mode, isLoading],
  );

  const totalOperations = useMemo(
    () => (operationsQuery.data ?? []).reduce((sum, row) => sum + row.operations_count, 0),
    [operationsQuery.data],
  );

  const stats = useMemo(
    () => buildOperationsDynamicsStats(chartData, aggregation, mode),
    [chartData, aggregation, mode],
  );

  return (
    <VCard className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>Рост количества операций</div>
        {!isLoading && <span className={styles.total}>Всего: {totalOperations}</span>}
      </div>
      <div className={styles.controls}>
        <VButtonGroup options={modeOptions} value={mode} onChange={setMode} />
        <VButtonGroup options={aggregationOptions} value={aggregation} onChange={setAggregation} />
      </div>

      <OperationsDynamicsStats stats={stats} />

      {isLoading ? (
        <div className={styles.loaderWrap}>
          <VLoader />
        </div>
      ) : (
        <GrowthChart
          data={chartData}
          color={mode === 'cumulative' ? 'var(--color-success)' : 'var(--color-accent)'}
          formatValue={formatCount}
          showChange={mode === 'cumulative'}
        />
      )}
    </VCard>
  );
};
