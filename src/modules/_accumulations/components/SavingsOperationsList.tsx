import { useAuth } from '@/shared/supabase/authProvider';
import { signedOperationAmount, type OperationType } from '@/shared/supabase/services/operations';
import { useThemeStyles } from '@/shared/theme';
import { VAccordion } from '@/shared/ui/VAccordion';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount } from '@/shared/utils';
import { useCategories } from '../api/useCategories';
import { useSavingsOperations } from '../api/useSavingsOperations';
import { groupItemsByCategory } from '../utils/groupByCategory';
import { SavingsOperationCard } from './SavingsOperationCard';

export const SavingsOperationsList = () => {
  const styles = useThemeStyles();
  const { user } = useAuth();
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
      {operationsQuery.error && (
        <VBanner type="error" visible message="Не удалось загрузить накопления из отчётов" />
      )}

      {operationsQuery.isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: styles.spacing.xl }}>
          <VLoader size={28} />
        </div>
      )}

      {!operationsQuery.isLoading &&
        !operationsQuery.error &&
        operations.length === 0 && (
          <VCard>
            <div style={{ color: styles.colors.textSecondary }}>
              Нет накоплений из отчётов
            </div>
          </VCard>
        )}

      {!operationsQuery.isLoading && operations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.m }}>
          {groups.map((group) => (
            <VAccordion
              key={group.key}
              header={
                <span style={{ display: 'flex', alignItems: 'center', gap: styles.spacing.m }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      flexShrink: 0,
                      borderRadius: styles.radius.round,
                      backgroundColor: group.color ?? styles.colors.border,
                    }}
                  />
                  <span style={{ flex: 1, minWidth: 0 }}>{group.label}</span>
                  <span style={{ fontWeight: styles.typography.fontWeight.bold }}>
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
                    )}
                  </span>
                </span>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.m }}>
                {group.items.map(renderCard)}
              </div>
            </VAccordion>
          ))}
        </div>
      )}
    </div>
  );
};