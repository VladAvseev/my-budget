import { useMemo, useState } from 'react';
import { VCard } from '@/shared/ui/VCard';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VSkeleton } from '@/shared/ui/VSkeleton';
import { VGrowthChart } from '@/shared/ui/VGrowthChart';
import type { AdminAudience } from '@/shared/api/types/admin';
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

// Фильтр по роли автора операций: всего (user + admin) / только пользователи.
const audienceOptions: VButtonGroupOption[] = [
  { value: 'all', label: 'Все' },
  { value: 'users', label: 'Пользователи' },
];

const formatCount = (v: number): string => Math.round(v).toLocaleString('ru-RU');

export const OperationsDynamicsCard = () => {
  const [mode, setMode] = useState<DynamicsChartMode>('cumulative');
  const [aggregation, setAggregation] = useState<DynamicsAggregation>('D');
  const [audience, setAudience] = useState<AdminAudience>('all');
  const operationsQuery = useAdminOperationsDynamics(audience);

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
        <VButtonGroup options={audienceOptions} value={audience} onChange={setAudience} />
        <VButtonGroup options={modeOptions} value={mode} onChange={setMode} />
        <VButtonGroup options={aggregationOptions} value={aggregation} onChange={setAggregation} />
      </div>

      <OperationsDynamicsStats stats={stats} />

      {isLoading ? (
        <VSkeleton width="100%" height={280} radius="var(--radius-m)" />
      ) : (
        <VGrowthChart
          data={chartData}
          color={mode === 'cumulative' ? 'var(--color-success)' : 'var(--color-accent)'}
          formatValue={formatCount}
          showChange={mode === 'cumulative'}
        />
      )}
    </VCard>
  );
};
