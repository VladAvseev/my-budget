import { useMemo, useState } from 'react';
import { VCard } from '@/shared/ui/VCard';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VLoader } from '@/shared/ui/VLoader';
import { VGrowthChart } from '@/shared/ui/VGrowthChart';
import type { AdminAudience } from '@/shared/api/types/admin';
import { useAdminLogsDynamics } from '../api/useAdminLogsDynamics';
import { buildLogsDynamics, type LogsBucket } from '../utils/buildLogsDynamicsData';
import { buildLogsDynamicsStats } from '../utils/buildLogsDynamicsStats';
import styles from './LogsDynamicsCard.module.css';

// Фильтр по роли автора логов: всего (user + admin) / только пользователи.
const audienceOptions: VButtonGroupOption[] = [
  { value: 'all', label: 'Все' },
  { value: 'users', label: 'Пользователи' },
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
  const [bucket, setBucket] = useState<LogsBucket>('hour');
  const dynamicsQuery = useAdminLogsDynamics(audience);

  const isLoading = dynamicsQuery.isLoading;

  const built = useMemo(
    () =>
      isLoading
        ? { chartData: [], hourSeries: [], daySeries: [], total: 0 }
        : buildLogsDynamics(dynamicsQuery.data?.points ?? [], bucket),
    [dynamicsQuery.data, bucket, isLoading],
  );

  const stats = useMemo(() => buildLogsDynamicsStats(built), [built]);

  return (
    <VCard className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>Количество логов</div>
        {!isLoading && <span className={styles.total}>Всего: {formatCount(built.total)}</span>}
      </div>
      <div className={styles.controls}>
        <VButtonGroup options={audienceOptions} value={audience} onChange={setAudience} />
        <VButtonGroup options={bucketOptions} value={bucket} onChange={setBucket} />
      </div>

      {isLoading ? (
        <div className={styles.loaderWrap}>
          <VLoader />
        </div>
      ) : (
        <>
          <div className={styles.stats}>
            <Stat label="В среднем за час" value={formatMetric(stats.avgPerHour)} />
            <Stat label="В среднем за день" value={formatMetric(stats.avgPerDay)} />
            <Stat label="За последний час" value={formatMetric(stats.lastHour)} />
            <Stat label="За последний день" value={formatMetric(stats.lastDay)} />
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
