import { buildGoalsProgress, formatAmount, type GoalProgress } from '@/shared/utils';
import {
  useAccumulationsTotal,
  useAmountsVisibility,
  useGoals,
  HIDDEN_AMOUNT,
} from '@/shared/hooks';
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
  const { showCapital } = useAmountsVisibility();

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

  const progressList = useMemo<GoalProgress[]>(
    () => buildGoalsProgress(goalsQuery.data ?? [], accumulations, savingsQuery.data ?? []),
    [goalsQuery.data, accumulations, savingsQuery.data],
  );

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

  const formatPair = (savedAmount: number, targetAmount: number) =>
    showCapital
      ? `${formatAmount(savedAmount)} из ${formatAmount(targetAmount)}`
      : `${HIDDEN_AMOUNT} из ${HIDDEN_AMOUNT}`;

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
              <>
                <div className={styles.structureTotal}>
                  {showCapital ? formatAmount(total) : HIDDEN_AMOUNT}
                </div>
                <AccumulationsLegend
                  items={structureItems}
                  categories={categories}
                  maskAmounts={!showCapital}
                  fullWidth
                />
              </>
            ) : (
              <div className={styles.emptyMessage}>Доли накоплений невозможно отобразить</div>
            )}
          </div>
        )}

        {hasStructure && hasGoals && <div className={styles.divider} />}

        {hasGoals && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Цели</div>
            <div className={styles.goalsList}>
              {progressList.map((progress) => {
                const category =
                  categories.find((item) => item.id === progress.goal.category_id) ?? null;
                const targetAmount = Number(progress.goal.amount) || 0;

                return (
                  <div key={progress.goal.id} className={styles.goalItem}>
                    <div className={styles.goalTop}>
                      <span
                        className={styles.goalDot}
                        style={{
                          backgroundColor: category?.color ?? 'var(--color-border)',
                        }}
                      />
                      <span className={styles.goalName}>{category?.name ?? 'Без категории'}</span>
                      <span className={styles.goalPercent}>{progress.percent}%</span>
                    </div>
                    <div className={styles.goalBar}>
                      <div
                        className={styles.goalBarFill}
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                    <div className={styles.goalAmounts}>
                      {formatPair(progress.savedAmount, targetAmount)}
                    </div>
                  </div>
                );
              })}
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
