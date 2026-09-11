import { buildGoalsOverallFromTotals, formatAmount } from '@/shared/utils';
import {
  useBootstrap,
  useCurrency,
  type BootstrapGoalItem,
  type BootstrapSavingsItem,
} from '@/shared/api/hooks';
import { ChevronRightIcon, SavingsIcon } from '@/shared/icons';
import { VCard } from '@/shared/ui/VCard';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AccumulationsLegend } from './AccumulationsStructure';
import { CardSkeleton } from './CardSkeleton';
import styles from '../homeCard.module.css';

const EMPTY_SAVINGS: BootstrapSavingsItem[] = [];
const EMPTY_GOALS: BootstrapGoalItem[] = [];

export const AccumulationsCard = () => {
  const { data, isLoading } = useBootstrap();
  const currency = useCurrency();

  const structure = data?.savingsStructure ?? EMPTY_SAVINGS;
  const goals = data?.goals ?? EMPTY_GOALS;

  const savedByCategory = useMemo(
    () =>
      new Map(
        structure.flatMap((item) =>
          item.categoryId === null ? [] : ([[item.categoryId, item.amount]] as const),
        ),
      ),
    [structure],
  );

  // Формула — общая с buildGoalsOverallProgress (shared/utils/goals).
  const overall = useMemo(
    () => buildGoalsOverallFromTotals(goals, savedByCategory),
    [goals, savedByCategory],
  );

  if (isLoading) {
    return <CardSkeleton delay="0.24s" />;
  }

  const hasStructure = structure.length > 0;
  const hasGoals = goals.length > 0;

  if (!hasStructure && !hasGoals) {
    return null;
  }

  const total = structure.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const formatPair = (savedAmount: number, targetAmount: number) =>
    `${formatAmount(savedAmount, currency?.symbol)} из ${formatAmount(targetAmount, currency?.symbol)}`;

  return (
    <Link
      to="/accumulations"
      className={`${styles.link} ${styles.animateCard}`}
      style={{ animationDelay: '0.24s' }}
    >
      <VCard interactive className={styles.card}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>
            <SavingsIcon size={18} />
          </span>
          <div className={styles.title}>Накопления</div>
        </div>

        {hasStructure && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Структура накоплений</div>
            {total > 0 ? (
              <AccumulationsLegend items={structure} fullWidth />
            ) : (
              <div className={styles.emptyMessage}>Доли накоплений невозможно отобразить</div>
            )}
          </div>
        )}

        {hasStructure && hasGoals && <div className={styles.divider} />}

        {hasGoals && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Цели</div>
            <div className={styles.goalsOverall}>
              <div
                className={styles.goalBar}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={overall.percent}
              >
                <div className={styles.goalBarFill} style={{ width: `${overall.percent}%` }} />
              </div>
              <div className={styles.goalsOverallRow}>
                <span className={styles.goalAmounts}>
                  {formatPair(overall.totalSaved, overall.totalTarget)}
                </span>
                <span className={styles.goalPercent}>{overall.percent}%</span>
              </div>
            </div>
          </div>
        )}
      </VCard>
      <span className={styles.chevron}>
        <ChevronRightIcon size={18} />
      </span>
    </Link>
  );
};
