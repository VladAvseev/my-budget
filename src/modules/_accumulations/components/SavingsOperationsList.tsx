import { useAuth } from '@/shared/supabase/authProvider';
import { useCurrency } from '@/shared/hooks';
import { signedOperationAmount, type OperationType } from '@/shared/supabase/types/domain';
import { VAccordion } from '@/shared/ui/VAccordion';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount } from '@/shared/utils';
import commonStyles from '@/shared/styles/common.module.css';
import { useCategories } from '../api/useCategories';
import { useSavingsOperations } from '../api/useSavingsOperations';
import { groupItemsByCategory } from '../utils/groupByCategory';
import { SavingsOperationCard } from './SavingsOperationCard';
import styles from './AccumulationsList.module.css';

export const SavingsOperationsList = () => {
  const { user } = useAuth();
  const currency = useCurrency();
  const userId = user?.id ?? '';
  const operationsQuery = useSavingsOperations(userId);
  const categoriesQuery = useCategories(userId);

  const operations = operationsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const groups = groupItemsByCategory(operations, categories, (operation) => operation.category_id);

  const renderCard = (operation: (typeof operations)[number]) => (
    <SavingsOperationCard
      key={operation.id}
      operation={operation}
      category={
        operation.category_id
          ? categories.find((category) => category.id === operation.category_id) ?? null
          : null
      }
    />
  );

  return (
    <div className={styles.root}>
      {operationsQuery.error && (
        <VBanner type="error" visible message="Не удалось загрузить накопления из отчётов" />
      )}

      {operationsQuery.isLoading && (
        <div className={styles.loaderWrap}>
          <VLoader size={28} />
        </div>
      )}

      {!operationsQuery.isLoading &&
        !operationsQuery.error &&
        operations.length === 0 && (
          <VCard>
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>Нет накоплений из отчётов</div>
              <div className={styles.emptyHint}>
                Накопления появятся при создании операций в отчётах.
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
                        currency?.symbol,
                      )}
                    </span>
                  </span>
                }
              >
                <div className={styles.items}>
                  {group.items.map(renderCard)}
                </div>
              </VAccordion>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};