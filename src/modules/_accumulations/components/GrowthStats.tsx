import type { GrowthStats as GrowthStatsData } from '../utils/buildGrowthStats';
import { useCurrency } from '@/shared/hooks';
import { formatAmount } from '@/shared/utils/format';
import styles from './GrowthStats.module.css';

interface GrowthStatsProps {
  stats: GrowthStatsData;
  displaySymbol?: string;
}

const colorClass = (value: number): string =>
  value > 0 ? styles.positive : value < 0 ? styles.negative : '';

const formatPct = (value: number): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export const GrowthStats = ({ stats, displaySymbol }: GrowthStatsProps) => {
  const { monthly, periodLabel, currentPeriod, currentPeriodLabel } = stats;
  const currency = useCurrency();
  const symbol = displaySymbol ?? currency?.symbol ?? '₽';

  const formatSigned = (value: number): string => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${formatAmount(value, symbol)}`;
  };

  const formatChange = (change: { abs: number; pct: number | null }): string =>
    change.pct !== null
      ? `${formatSigned(change.abs)} (${formatPct(change.pct)})`
      : formatSigned(change.abs);

  const monthlyLine = monthly !== null ? formatChange(monthly) : null;

  const currentPeriodLine = currentPeriod !== null ? formatChange(currentPeriod) : null;

  if (!monthlyLine && !currentPeriodLine) return null;

  return (
    <div className={styles.stats}>
      {monthly !== null && (
        <div className={styles.stat}>
          {periodLabel}:{' '}
          <span className={`${styles.statValue} ${colorClass(monthly.abs)}`}>{monthlyLine}</span>
        </div>
      )}
      {currentPeriod !== null && (
        <div className={styles.stat}>
          {currentPeriodLabel}:{' '}
          <span className={`${styles.statValue} ${colorClass(currentPeriod.abs)}`}>
            {currentPeriodLine}
          </span>
        </div>
      )}
    </div>
  );
};
