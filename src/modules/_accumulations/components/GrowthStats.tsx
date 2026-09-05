import type { GrowthStats as GrowthStatsData } from '../utils/buildGrowthStats';
import { useCurrency } from '@/shared/hooks';
import { formatAmount } from '@/shared/utils/format';
import styles from './GrowthStats.module.css';

interface GrowthStatsProps {
  stats: GrowthStatsData;
}

const colorClass = (value: number): string =>
  value > 0 ? styles.positive : value < 0 ? styles.negative : '';

const formatPct = (value: number): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export const GrowthStats = ({ stats }: GrowthStatsProps) => {
  const { monthly, yearly, periodLabel } = stats;
  const currency = useCurrency();
  const symbol = currency?.symbol ?? '₽';

  const formatSigned = (value: number): string => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${formatAmount(value, symbol)}`;
  };

  const monthlyLine =
    monthly !== null
      ? monthly.pct !== null
        ? `${formatSigned(monthly.abs)} (${formatPct(monthly.pct)})`
        : `${formatSigned(monthly.abs)}`
      : null;

  const yearlyLabel = yearly !== null && yearly.months < 12 ? `За ${yearly.months} мес.` : 'За год';

  const yearlyLine =
    yearly !== null
      ? yearly.pct !== null
        ? `${formatSigned(yearly.abs)} (${formatPct(yearly.pct)})`
        : `${formatSigned(yearly.abs)}`
      : null;

  if (!monthlyLine && !yearlyLine) return null;

  return (
    <div className={styles.stats}>
      {monthly !== null && (
        <div className={styles.stat}>
          {periodLabel}:{' '}
          <span className={`${styles.statValue} ${colorClass(monthly.abs)}`}>{monthlyLine}</span>
        </div>
      )}
      {yearly !== null && (
        <div className={styles.stat}>
          {yearlyLabel}:{' '}
          <span className={`${styles.statValue} ${colorClass(yearly.abs)}`}>{yearlyLine}</span>
        </div>
      )}
    </div>
  );
};
