import type { DynamicsStats as DynamicsStatsData } from '../utils/buildOperationsDynamicsStats';
import styles from './OperationsDynamicsStats.module.css';

interface OperationsDynamicsStatsProps {
  stats: DynamicsStatsData;
}

const formatAbs = (value: number): string => Math.round(value).toLocaleString('ru-RU');

export const OperationsDynamicsStats = ({ stats }: OperationsDynamicsStatsProps) => {
  const { periodRate, lastPeriod, periodLabel, lastPeriodLabel } = stats;

  const periodLine = periodRate !== null ? formatAbs(periodRate.abs) : null;
  const lastLine = lastPeriod !== null ? formatAbs(lastPeriod.abs) : null;

  if (!periodLine && !lastLine) return null;

  return (
    <div className={styles.stats}>
      {periodLine && (
        <div className={styles.stat}>
          <span className={styles.statLabel}>{periodLabel}</span>
          <span className={styles.statValue}>{periodLine}</span>
        </div>
      )}
      {lastLine && (
        <div className={styles.stat}>
          <span className={styles.statLabel}>{lastPeriodLabel}</span>
          <span className={styles.statValue}>{lastLine}</span>
        </div>
      )}
    </div>
  );
};
