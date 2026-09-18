import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { VCard } from '@/shared/ui/VCard';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VSkeleton } from '@/shared/ui/VSkeleton';
import { VDeltaChart } from '@/shared/ui/VDeltaChart';
import { VGrowthChart } from '@/shared/ui/VGrowthChart';
import { useAdminOperationsDynamics } from '../api/useAdminOperationsDynamics';
import {
  operationsAggregationAtom,
  operationsAudienceAtom,
  operationsMetricAtom,
  operationsModeAtom,
} from '../atoms/dynamics';
import {
  buildOperationsDynamicsData,
  type DynamicsChartMode,
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


const audienceOptions: VButtonGroupOption[] = [
  { value: 'all', label: 'Все' },
  { value: 'users', label: 'Без админов' },
];


const metricOptions: VButtonGroupOption[] = [
  { value: 'count', label: 'Операции' },
  { value: 'unique_users', label: 'Пользователи' },
];

const formatCount = (v: number): string => Math.round(v).toLocaleString('ru-RU');

export const OperationsDynamicsCard = () => {
  const [mode, setMode] = useAtom(operationsModeAtom);
  const [aggregation, setAggregation] = useAtom(operationsAggregationAtom);
  const [audience, setAudience] = useAtom(operationsAudienceAtom);
  const [metric, setMetric] = useAtom(operationsMetricAtom);

  
  
  const effectiveMode: DynamicsChartMode = metric === 'unique_users' ? 'period' : mode;

  const operationsQuery = useAdminOperationsDynamics({ audience, metric, aggregation });
  const isLoading = operationsQuery.isLoading;
  
  
  const isStale = operationsQuery.isPlaceholderData;

  const chartData = useMemo(
    () =>
      isLoading
        ? []
        : buildOperationsDynamicsData({
            points: operationsQuery.data?.points ?? [],
            aggregation,
            mode: effectiveMode,
            metric,
          }),
    [operationsQuery.data, aggregation, effectiveMode, metric, isLoading],
  );

  const totalOperations = operationsQuery.data?.total ?? 0;

  const stats = useMemo(
    () => buildOperationsDynamicsStats(chartData, aggregation, effectiveMode, metric),
    [chartData, aggregation, effectiveMode, metric],
  );

  const title =
    metric === 'unique_users' ? 'Активность уникальных пользователей' : 'Рост количества операций';

  return (
    <VCard className={`${styles.card} ${styles.hero}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {!isLoading && (
          <div className={styles.totalWrap}>
            <span className={styles.totalLabel}>Всего</span>
            <span className={styles.total}>{totalOperations.toLocaleString('ru-RU')}</span>
          </div>
        )}
      </div>
      <div className={styles.controls}>
        <div className={styles.controlsGroup}>
          <VButtonGroup options={metricOptions} value={metric} onChange={setMetric} />
          <VButtonGroup options={aggregationOptions} value={aggregation} onChange={setAggregation} />
        </div>
        <div className={styles.controlsGroup}>
          {metric === 'count' && (
            <VButtonGroup options={modeOptions} value={mode} onChange={setMode} />
          )}
          <VButtonGroup options={audienceOptions} value={audience} onChange={setAudience} />
        </div>
      </div>

      <div className={isStale ? styles.stale : undefined}>
        <OperationsDynamicsStats stats={stats} />

        {isLoading ? (
          <VSkeleton width="100%" height={280} radius="var(--md-sys-shape-corner-small)" />
        ) : effectiveMode === 'cumulative' ? (
          <VGrowthChart
            data={chartData}
            color="var(--sys-color-positive-ink)"
            formatValue={formatCount}
            showChange={true}
          />
        ) : (
          <VDeltaChart
            data={chartData}
            color="var(--md-sys-color-primary)"
            formatValue={formatCount}
          />
        )}
      </div>
    </VCard>
  );
};
