import { useMemo, useState } from 'react';
import { VCard } from '@/shared/ui/VCard';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VSkeleton } from '@/shared/ui/VSkeleton';
import { VGrowthChart } from '@/shared/ui/VGrowthChart';
import type { AdminAudience, AdminChartMetric, AdminLogsBucket } from '@/shared/api/types/admin';
import { useAdminLogsDynamics } from '../api/useAdminLogsDynamics';
import { buildLogsDynamics } from '../utils/buildLogsDynamicsData';
import { buildLogsDynamicsStats } from '../utils/buildLogsDynamicsStats';
import styles from './LogsDynamicsCard.module.css';

// Фильтр по роли автора логов: всего (user + admin) / только пользователи.
const audienceOptions: VButtonGroupOption[] = [
  { value: 'all', label: 'Все' },
  { value: 'users', label: 'Пользователи' },
];

// Метрика графика: количество логов или уникальные авторы.
const metricOptions: VButtonGroupOption[] = [
  { value: 'count', label: 'Количество' },
  { value: 'unique_users', label: 'Уникальные' },
];

// Гранулярность точек графика: группировка логов за час или за день.
const bucketOptions: VButtonGroupOption[] = [
  { value: 'hour', label: 'Час' },
  { value: 'day', label: 'День' },
];

const formatCount = (value: number): string => Math.round(value).toLocaleString('ru-RU');

const formatMetric = (value: number | null): string => (value === null ? '—' : formatCount(value));

interface StatProps {
  label: string;
  value: string;
}

const Stat: React.FC<StatProps> = ({ label, value }) => (
  <div className={styles.stat}>
    {label}: <span className={styles.statValue}>{value}</span>
  </div>
);

export const LogsDynamicsCard = () => {
  const [audience, setAudience] = useState<AdminAudience>('all');
  const [metric, setMetric] = useState<AdminChartMetric>('count');
  const [bucket, setBucket] = useState<AdminLogsBucket>('hour');
  const dynamicsQuery = useAdminLogsDynamics({ audience, metric, bucket });

  const isLoading = dynamicsQuery.isLoading;

  const built = useMemo(
    () =>
      isLoading
        ? { chartData: [], total: 0 }
        : buildLogsDynamics(dynamicsQuery.data?.points ?? [], bucket, dynamicsQuery.data?.total ?? 0),
    [dynamicsQuery.data, bucket, isLoading],
  );

  const stats = useMemo(() => buildLogsDynamicsStats(built), [built]);

  const bucketLabel = bucket === 'hour' ? 'час' : 'сутки';
  const uniquePrefix = metric === 'unique_users' ? 'Уникальных ' : '';
  const avgLabel = `В среднем ${uniquePrefix}за ${bucketLabel}`;
  const lastLabel = `${uniquePrefix}за последний ${bucket === 'hour' ? 'час' : 'день'}`;
  const title = metric === 'unique_users' ? 'Динамика уникальных авторов' : 'Количество логов';

  return (
    <VCard className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        {!isLoading && <span className={styles.total}>Всего: {formatCount(built.total)}</span>}
      </div>
      <div className={styles.controls}>
        <VButtonGroup options={audienceOptions} value={audience} onChange={setAudience} />
        <VButtonGroup options={metricOptions} value={metric} onChange={setMetric} />
        <VButtonGroup options={bucketOptions} value={bucket} onChange={setBucket} />
      </div>

      {isLoading ? (
        <div className={styles.skeletonWrap}>
          <div className={styles.skeletonStats}>
            {[0, 1].map((i) => (
              <VSkeleton key={i} width={180} height={18} />
            ))}
          </div>
          <VSkeleton width="100%" height={240} radius="var(--radius-m)" />
        </div>
      ) : (
        <>
          <div className={styles.stats}>
            <Stat label={avgLabel} value={formatMetric(stats.avgPerBucket)} />
            <Stat label={lastLabel} value={formatMetric(stats.lastBucket)} />
          </div>
          <VGrowthChart
            data={built.chartData}
            color="var(--color-accent)"
            formatValue={formatCount}
          />
        </>
      )}
    </VCard>
  );
};
