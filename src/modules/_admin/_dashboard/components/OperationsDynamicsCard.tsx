import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { VCard } from '@/shared/ui/VCard';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VSkeleton } from '@/shared/ui/VSkeleton';
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

// Фильтр по роли автора операций: всего (user + admin) / только пользователи.
const audienceOptions: VButtonGroupOption[] = [
  { value: 'all', label: 'Все' },
  { value: 'users', label: 'Пользователи' },
];

// Метрика графика: количество операций или уникальные авторы.
const metricOptions: VButtonGroupOption[] = [
  { value: 'count', label: 'Количество' },
  { value: 'unique_users', label: 'Уникальные' },
];

const formatCount = (v: number): string => Math.round(v).toLocaleString('ru-RU');

export const OperationsDynamicsCard = () => {
  const [mode, setMode] = useAtom(operationsModeAtom);
  const [aggregation, setAggregation] = useAtom(operationsAggregationAtom);
  const [audience, setAudience] = useAtom(operationsAudienceAtom);
  const [metric, setMetric] = useAtom(operationsMetricAtom);

  // Уникальных пользователей нельзя накопить суммой периодов, поэтому в этом
  // режиме график всегда показывает значения за период.
  const effectiveMode: DynamicsChartMode = metric === 'unique_users' ? 'period' : mode;

  const operationsQuery = useAdminOperationsDynamics({ audience, metric, aggregation });
  const isLoading = operationsQuery.isLoading;
  // keepPreviousData: на смене фильтра показываем прошлый график, приглушая его
  // до прихода нового, вместо мигания скелетоном.
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
    metric === 'unique_users' ? 'Рост уникальных пользователей' : 'Рост количества операций';

  return (
    <VCard className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        {!isLoading && <span className={styles.total}>Всего: {totalOperations}</span>}
      </div>
      <div className={styles.controls}>
        <VButtonGroup options={audienceOptions} value={audience} onChange={setAudience} />
        <VButtonGroup options={metricOptions} value={metric} onChange={setMetric} />
        {metric === 'count' && (
          <VButtonGroup options={modeOptions} value={mode} onChange={setMode} />
        )}
        <VButtonGroup
          options={aggregationOptions}
          value={aggregation}
          onChange={setAggregation}
        />
      </div>

      <div className={isStale ? styles.stale : undefined}>
        <OperationsDynamicsStats stats={stats} />

        {isLoading ? (
          <VSkeleton width="100%" height={280} radius="var(--radius-m)" />
        ) : (
          <VGrowthChart
            data={chartData}
            color={effectiveMode === 'cumulative' ? 'var(--color-success)' : 'var(--color-accent)'}
            formatValue={formatCount}
            showChange={effectiveMode === 'cumulative'}
          />
        )}
      </div>
    </VCard>
  );
};
