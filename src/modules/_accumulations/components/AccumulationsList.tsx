import { useAuth } from '@/shared/api/authProvider';
import { useAccumulations } from '@/shared/api/hooks';
import { useMemo } from 'react';
import { VAccordion } from '@/shared/ui/VAccordion';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VSkeletonList } from '@/shared/ui/VSkeleton';
import { formatAmount } from '@/shared/utils';
import commonStyles from '@/shared/styles/common.module.css';
import { useCategories } from '../api/useCategories';
import { useDisplayCurrency } from '../hooks/useDisplayCurrency';
import { groupItemsByCategory } from '../utils/groupByCategory';
import { AccumulationCard } from './AccumulationCard';
import styles from './AccumulationsList.module.css';

const EMPTY_ARRAY: never[] = [];

export const AccumulationsList = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const accumulationsQuery = useAccumulations(userId);
  const categoriesQuery = useCategories(userId);
  const { displaySymbol, convertOptions } = useDisplayCurrency();

  const accumulations = accumulationsQuery.data ?? EMPTY_ARRAY;
  const categories = categoriesQuery.data ?? EMPTY_ARRAY;

  const groups = useMemo(() => {
    const result = groupItemsByCategory(
      accumulations,
      categories,
      (accumulation) => accumulation.category_id,
    );
    result.sort((a, b) => {
      const totalA = a.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const totalB = b.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      return totalB - totalA;
    });
    return result;
  }, [accumulations, categories]);

  return (
    <div className={styles.root}>
      {accumulationsQuery.error && accumulationsQuery.data == null && (
        <VErrorCard
          title="Не удалось загрузить начальные накопления"
          error={accumulationsQuery.error}
          onRetry={() => void accumulationsQuery.refetch()}
          isRetrying={accumulationsQuery.isFetching}
        />
      )}

      {accumulationsQuery.error && accumulationsQuery.data != null && (
        <VBanner type="error" visible message="Не удалось загрузить начальные накопления" />
      )}

      {accumulationsQuery.isLoading && (
        <VSkeletonList count={3} cardProps={{ compact: true, title: false, lines: 2 }} />
      )}

      {!accumulationsQuery.isLoading && !accumulationsQuery.error && accumulations.length === 0 && (
        <VCard>
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>
              Начальные накопления — это накопления, которые были до начала ведения учёта.
            </div>
            <div className={styles.emptyHint}>
              Нажмите «+», чтобы создать первое начальное накопление.
            </div>
          </div>
        </VCard>
      )}

      {!accumulationsQuery.isLoading && accumulations.length > 0 && (
        <div className={styles.list}>
          {groups.map((group, groupIndex) => (
            <div
              key={group.key}
              className={commonStyles.animateCard}
              style={{ animationDelay: `${groupIndex * 0.03}s` }}
            >
              <VAccordion
                header={
                  <span className={styles.accordionHeader}>
                    <span
                      className={styles.accordionDot}
                      style={{ backgroundColor: group.color ?? 'var(--color-border)' }}
                    />
                    <span className={styles.accordionLabel}>{group.label}</span>
                    <span className={styles.accordionTotal}>
                      {formatAmount(
                        group.items.reduce(
                          (sum, accumulation) => sum + (Number(accumulation.amount) || 0),
                          0,
                        ),
                        displaySymbol,
                        convertOptions,
                      )}
                    </span>
                  </span>
                }
              >
                <div className={styles.items}>
                  {group.items.map((accumulation) => (
                    <AccumulationCard
                      key={accumulation.id}
                      accumulation={accumulation}
                      pending={Boolean((accumulation as { _optimistic?: boolean })._optimistic)}
                      category={
                        accumulation.category_id
                          ? (categories.find(
                              (category) => category.id === accumulation.category_id,
                            ) ?? null)
                          : null
                      }
                    />
                  ))}
                </div>
              </VAccordion>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
