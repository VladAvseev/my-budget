import { PlusIcon } from '@/shared/icons';
import { useAccumulations, useGoals } from '@/shared/hooks';
import { useAuth } from '@/shared/supabase/authProvider';
import type { Goal } from '@/shared/supabase/types/domain';
import { buildGoalsProgress, formatAmount } from '@/shared/utils';
import { VBadge } from '@/shared/ui/VBadge';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VCategoryDot } from '@/shared/ui/VCategoryDot';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VLoader } from '@/shared/ui/VLoader';
import commonStyles from '@/shared/styles/common.module.css';
import { useSetAtom } from 'jotai';
import { goalModalAtom } from '../atoms/accumulations';
import { useCategories } from '../api/useCategories';
import { useSavingsOperations } from '../api/useSavingsOperations';
import styles from './GoalsSection.module.css';

export const GoalsSection = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const goalsQuery = useGoals(userId);
  const accumulationsQuery = useAccumulations(userId);
  const savingsQuery = useSavingsOperations(userId);
  const categoriesQuery = useCategories(userId);
  const setGoalModal = useSetAtom(goalModalAtom);

  const goals = goalsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const progressList = buildGoalsProgress(
    goals,
    accumulationsQuery.data ?? [],
    savingsQuery.data ?? [],
  );

  const isLoading =
    goalsQuery.isLoading ||
    accumulationsQuery.isLoading ||
    savingsQuery.isLoading ||
    categoriesQuery.isLoading;

  const categoryById = new Map(categories.map((category) => [category.id, category]));

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={commonStyles.titleXl}>Цели</div>
        <VIconButton
          ariaLabel="Установить цель"
          onClick={() => setGoalModal({ goal: null })}
          isDisabled={isLoading}
          color="var(--color-accent)"
        >
          <PlusIcon size={24} color="currentColor" />
        </VIconButton>
      </div>

      {goalsQuery.error && (
        <VBanner type="error" visible message="Не удалось загрузить цели" />
      )}

      {isLoading && (
        <div className={styles.loaderWrap}>
          <VLoader size={28} />
        </div>
      )}

      {!isLoading &&
        !goalsQuery.error &&
        goals.length === 0 && (
          <VCard>
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>Нет целей</div>
              <div className={styles.emptyHint}>
                Нажмите «+», чтобы задать желаемую сумму накоплений по категории.
              </div>
            </div>
          </VCard>
        )}

      {!isLoading && progressList.length > 0 && (
        <div className={styles.list}>
          {progressList.map((progress, index) => {
            const goal: Goal = progress.goal;
            const category =
              categoryById.get(goal.category_id) ?? null;
            const pending = Boolean(
              (goal as { _optimistic?: boolean })._optimistic,
            );
            const targetAmount = Number(goal.amount) || 0;

            return (
              <VCard
                key={goal.id}
                role="button"
                tabIndex={pending ? -1 : 0}
                aria-disabled={pending}
                aria-label={`Цель: ${category?.name ?? 'Без категории'}`}
                onClick={() => {
                  if (!pending) {
                    setGoalModal({ goal });
                  }
                }}
                onKeyDown={(event) => {
                  if (!pending && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    setGoalModal({ goal });
                  }
                }}
                className={`${commonStyles.animateCard} ${styles.card}`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className={styles.cardTop}>
                  {category?.color ? (
                    <VCategoryDot color={category.color} />
                  ) : (
                    <span className={styles.dot} />
                  )}
                  <span className={styles.cardTitle}>
                    {category?.name ?? 'Без категории'}
                  </span>
                  {progress.reached && <VBadge variant="success">Цель достигнута</VBadge>}
                </div>

                <div
                  className={styles.track}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress.percent}
                >
                  <div
                    className={styles.fill}
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>

                <div className={styles.cardBottom}>
                  <span className={styles.savedAmount}>
                    {formatAmount(progress.savedAmount)}
                  </span>
                  <span className={styles.targetAmount}>
                    из {formatAmount(targetAmount)}
                  </span>
                  <span className={styles.percent}>{progress.percent}%</span>
                </div>
              </VCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
