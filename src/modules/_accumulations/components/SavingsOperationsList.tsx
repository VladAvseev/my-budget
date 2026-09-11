import { useAuth } from '@/shared/api/authProvider';
import { signedOperationAmount, type OperationType } from '@/shared/api/types/domain';
import { useMemo } from 'react';
import { VAccordion } from '@/shared/ui/VAccordion';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VSkeletonList } from '@/shared/ui/VSkeleton';
import { formatAmount } from '@/shared/utils';
import commonStyles from '@/shared/styles/common.module.css';
import { useCategories } from '../api/useCategories';
import { useSavingsOperations } from '@/shared/api/hooks';
import { useDisplayCurrency } from '../hooks/useDisplayCurrency';
import { groupItemsByCategory } from '../utils/groupByCategory';
import { SavingsOperationCard } from './SavingsOperationCard';
import styles from './AccumulationsList.module.css';

const EMPTY_ARRAY: never[] = [];

export const SavingsOperationsList = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const operationsQuery = useSavingsOperations(userId);
  const categoriesQuery = useCategories(userId);
  const { displaySymbol, convertOptions } = useDisplayCurrency();

  const operations = operationsQuery.data ?? EMPTY_ARRAY;
  const categories = categoriesQuery.data ?? EMPTY_ARRAY;

  const groups = useMemo(() => {
    const result = groupItemsByCategory(
      operations,
      categories,
      (operation) => operation.category_id,
    );
    result.sort((a, b) => {
      const totalA = a.items.reduce(
        (_sum, op) =>
          _sum + Math.abs(signedOperationAmount(op.type as OperationType, Number(op.amount) || 0)),
        0,
      );
      const totalB = b.items.reduce(
        (_sum, op) =>
          _sum + Math.abs(signedOperationAmount(op.type as OperationType, Number(op.amount) || 0)),
        0,
      );
      return totalB - totalA;
    });
    return result;
  }, [operations, categories]);

  const renderCard = (operation: (typeof operations)[number]) => (
    <SavingsOperationCard
      key={operation.id}
      operation={operation}
      category={
        operation.category_id
          ? (categories.find((category) => category.id === operation.category_id) ?? null)
          : null
      }
    />
  );

  return (
    <div className={styles.root}>
      {operationsQuery.error && operationsQuery.data == null && (
        <VErrorCard
          title="Не удалось загрузить накопления"
          error={operationsQuery.error}
          onRetry={() => void operationsQuery.refetch()}
          isRetrying={operationsQuery.isFetching}
        />
      )}

      {operationsQuery.error && operationsQuery.data != null && (
        <VBanner type="error" visible message="Не удалось загрузить накопления" />
      )}

      {operationsQuery.isLoading && (
        <VSkeletonList count={3} cardProps={{ compact: true, title: false, lines: 2 }} />
      )}

      {!operationsQuery.isLoading && !operationsQuery.error && operations.length === 0 && (
        <VCard>
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>Нет накоплений</div>
            <div className={styles.emptyHint}>
              Накопления появятся при добавлении операций в периодах.
            </div>
          </div>
        </VCard>
      )}

      {!operationsQuery.isLoading && operations.length > 0 && (
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
                          (sum, operation) =>
                            sum +
                            signedOperationAmount(
                              operation.type as OperationType,
                              Number(operation.amount) || 0,
                            ),
                          0,
                        ),
                        displaySymbol,
                        convertOptions,
                      )}
                    </span>
                  </span>
                }
              >
                <div className={styles.items}>{group.items.map(renderCard)}</div>
              </VAccordion>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
