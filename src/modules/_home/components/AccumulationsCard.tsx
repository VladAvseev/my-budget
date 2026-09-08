import {
  buildGoalsOverallProgress,
  buildGoalsProgress,
  formatAmount,
  type GoalProgress,
} from '@/shared/utils';
import { useAccumulationsTotal, useCurrency, useGoals } from '@/shared/hooks';
import { ChevronRightIcon, SavingsIcon } from '@/shared/icons';
import { useAuth } from '@/shared/supabase/authProvider';
import { signedOperationAmount, type OperationType } from '@/shared/supabase/types/domain';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../api/useCategories';
import { useSavingsOperations } from '../api/useSavingsOperations';
import { AccumulationsLegend } from './AccumulationsStructure';
import styles from '../homeCard.module.css';

export const AccumulationsCard = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const accumulationsQuery = useAccumulationsTotal(userId);
  const savingsQuery = useSavingsOperations(userId);
  const categoriesQuery = useCategories(userId);
  const goalsQuery = useGoals(userId);
  const currency = useCurrency();

  const accumulations = accumulationsQuery.accumulations;
  const categories = categoriesQuery.data ?? [];

  const structureItems = useMemo(
    () => [
      ...accumulations.map((accumulation) => ({
        categoryId: accumulation.category_id,
        amount: Number(accumulation.amount) || 0,
      })),
      ...(savingsQuery.data ?? []).map((operation) => ({
        categoryId: operation.category_id,
        amount: signedOperationAmount(
          operation.type as OperationType,
          Number(operation.amount) || 0,
        ),
      })),
    ],
    [accumulations, savingsQuery.data],
  );

  const progressList = useMemo<GoalProgress[]>(() => {
    const list = buildGoalsProgress(goalsQuery.data ?? [], accumulations, savingsQuery.data ?? []);
    list.sort((a, b) => Math.abs(b.savedAmount) - Math.abs(a.savedAmount));
    return list;
  }, [goalsQuery.data, accumulations, savingsQuery.data]);

  const isLoading =
    accumulationsQuery.isLoading ||
    savingsQuery.isLoading ||
    categoriesQuery.isLoading ||
    goalsQuery.isLoading;

  if (isLoading) {
    return (
      <VCard
        className={`${styles.loadingCard} ${styles.animateCard}`}
        style={{ animationDelay: '0.24s' }}
      >
        <VLoader size={28} />
      </VCard>
    );
  }

  const hasStructure = structureItems.length > 0;
  const hasGoals = (goalsQuery.data?.length ?? 0) > 0;

  if (!hasStructure && !hasGoals) {
    return null;
  }

  const total = structureItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const overall = buildGoalsOverallProgress(progressList);

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
              <AccumulationsLegend
                items={structureItems}
                categories={categories}
                fullWidth
              />
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
                <div
                  className={styles.goalBarFill}
                  style={{ width: `${overall.percent}%` }}
                />
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
