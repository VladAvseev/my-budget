import { CurrencyText } from '@/shared/ui/Amount';
import { useBootstrap, useCurrency } from '@/shared/api/hooks';
import { CapitalIcon, ChevronRightIcon } from '@/shared/icons';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount, formatDisplay } from '@/shared/utils';
import { Link } from 'react-router-dom';
import { CardSkeleton } from './CardSkeleton';
import styles from '../homeCard.module.css';

// Зеркало хелперов длительности из GoalsSection (client/src/modules/_capital):
// GoalsSection не трогаем, поэтому копия здесь, тексты 1-в-1.
const pluralYears = (years: number): string => {
  const mod10 = years % 10;
  const mod100 = years % 100;
  if (mod10 === 1 && mod100 !== 11) return `${years} год`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${years} года`;
  return `${years} лет`;
};

const formatMonthsDuration = (totalMonths: number): string => {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(pluralYears(years));
  if (months > 0) parts.push(`${months} мес.`);
  return parts.join(' ');
};

export const GoalsCard = () => {
  const { data, isLoading } = useBootstrap();
  const currency = useCurrency();

  if (isLoading) {
    return <CardSkeleton delay="0.06s" wide />;
  }

  const summary = data?.goalsSummary;
  if (!summary || !summary.hasGoals) {
    return null;
  }

  const remaining = Math.max(0, summary.totalTarget - summary.totalSaved);

  let forecastText: string | null = null;
  if (remaining > 0) {
    if (summary.growthAvg === null) {
      forecastText = 'Недостаточно истории для прогноза';
    } else if (summary.growthAvg <= 0) {
      forecastText = 'недостижима при текущем темпе';
    } else if (summary.forecastMonths === null || summary.forecastDate === null) {
      forecastText = 'Срок достижения слишком велик';
    } else {
      const basis =
        summary.growthMonths > 0 && summary.growthMonths < 12
          ? ' (по ' + summary.growthMonths + ' мес.)'
          : '';
      forecastText =
        'Достижима к ' +
        formatDisplay(summary.forecastDate) +
        ' (за ' +
        formatMonthsDuration(summary.forecastMonths) +
        ')' +
        basis;
    }
  }

  return (
    <Link to="/capital" className={styles.link}>
      <VCard interactive className={styles.card}>
        <div className={styles.titleRow}>
          <span className={styles.titleChip}>
            <CapitalIcon size={20} />
          </span>
          <div className={styles.title}>Цели</div>
        </div>
        <div className={styles.goalsBlock}>
          <div className={styles.goalsBottom}>
            <span className={styles.goalsSaved}>
              <CurrencyText>{formatAmount(summary.totalSaved, currency?.symbol)}</CurrencyText>
            </span>
            <span className={styles.goalsTarget}>
              из <CurrencyText>{formatAmount(summary.totalTarget, currency?.symbol)}</CurrencyText>
            </span>
            <span className={styles.goalsPercent}>{summary.percent}%</span>
          </div>
          <div
            className={styles.goalsTrack}
            aria-label="Общий прогресс целей"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={summary.percent}
          >
            <div className={styles.goalsFill} style={{ width: `${summary.percent}%` }} />
          </div>
        </div>
        {summary.monthlyPlan > 0 && (
          <div className={styles.goalsPeriod}>
            Пополнено в этом месяце на{' '}
            <CurrencyText>
              {formatAmount(summary.currentPeriodSaved, currency?.symbol)}
            </CurrencyText>{' '}
            из <CurrencyText>{formatAmount(summary.monthlyPlan, currency?.symbol)}</CurrencyText>
          </div>
        )}
        {forecastText && <div className={styles.goalsForecast}>{forecastText}</div>}
      </VCard>
      <span className={styles.chevron} aria-hidden="true">
        <ChevronRightIcon size={20} />
      </span>
    </Link>
  );
};
