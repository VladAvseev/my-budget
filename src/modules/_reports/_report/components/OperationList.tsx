import { PlusIcon } from '@/shared/icons';
import { useMemo } from 'react';
import { useAuth } from '@/shared/supabase/authProvider';
import type { Operation, OperationType } from '@/shared/supabase/services/operations';
import { useThemeStyles } from '@/shared/theme';
import { VAccordion } from '@/shared/ui/VAccordion';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VLoader } from '@/shared/ui/VLoader';
import { VToggle } from '@/shared/ui/VToggle';
import { formatAmount } from '@/shared/utils';
import { useAtom, useSetAtom } from 'jotai';
import { groupedByTypeAtom, operationModalAtom } from '../atoms/report';
import { categoryTypeForOperation } from '../api/categoryTypeForOperation';
import { useCategoryLimits } from '../api/useCategoryLimits';
import { useCategories } from '../api/useCategories';
import { useOperations, useSavingsReportOperations } from '../api/useOperations';
import { OperationCard } from './OperationCard';
import { CategoryLimitsSummary, formatLimitValue, getLimitColor } from './CategoryLimitsSummary';
import { isSavingsType, signedOperationAmount } from '@/shared/supabase/services/operations';

interface OperationListProps {
  reportId: string;
  type: OperationType;
}

export const OperationList = ({ reportId, type }: OperationListProps) => {
  const styles = useThemeStyles();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const operationsQuery = useOperations(reportId, type);
  const savingsQueries = useSavingsReportOperations(reportId);
  const isSavings = isSavingsType(type);
  const categoriesQuery = useCategories(userId, categoryTypeForOperation(type));
  const limitsQuery = useCategoryLimits(type === 'expense' ? reportId : '');
  const setModal = useSetAtom(operationModalAtom);
  const [groupedByType, setGroupedByType] = useAtom(groupedByTypeAtom);

  const operations = useMemo(
    () =>
      isSavings
        ? [...(savingsQueries[0]?.data ?? []), ...(savingsQueries[1]?.data ?? [])].sort((a, b) =>
            (b.created_at ?? '').localeCompare(a.created_at ?? ''),
          )
        : (operationsQuery.data ?? []),
    [isSavings, savingsQueries, operationsQuery.data],
  );
  const operationsLoading = isSavings
    ? savingsQueries.some((query) => query.isLoading)
    : operationsQuery.isLoading;
  const operationsError = isSavings
    ? savingsQueries.find((query) => query.error)?.error
    : operationsQuery.error;
  const categories = categoriesQuery.data ?? [];
  const limits = limitsQuery.data ?? [];
  const isGrouped = groupedByType[type] ?? false;

  const toggleGrouping = (next: boolean) => {
    setGroupedByType((prev) => ({ ...prev, [type]: next }));
  };

  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const limitsByCategory = new Map(limits.map((limit) => [limit.category_id, limit]));

  const groups = useMemo(() => {
    const queryOperations = isSavings ? operations : (operationsQuery.data ?? []);
    const queryCategories = categoriesQuery.data ?? [];
    const result: { key: string; label: string; color?: string; operations: Operation[] }[] = [];
    for (const category of queryCategories) {
      const grouped = queryOperations.filter((operation) => operation.category_id === category.id);
      if (grouped.length > 0) {
        result.push({
          key: category.id,
          label: category.name,
          color: category.color ?? undefined,
          operations: grouped,
        });
      }
    }
    const withoutCategory = queryOperations.filter((operation) => !operation.category_id);
    if (withoutCategory.length > 0) {
      result.push({ key: 'none', label: 'Без категории', operations: withoutCategory });
    }
    return result;
  }, [isSavings, operations, operationsQuery.data, categoriesQuery.data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
      {type === 'expense' && (
        <CategoryLimitsSummary operations={operations} limits={limits} categories={categories} />
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: styles.spacing.m,
        }}
      >
        <VToggle label="Группировать по категориям" checked={isGrouped} onChange={toggleGrouping} />
        <VIconButton
          ariaLabel="Новая операция"
          onClick={() => setModal({ type, operation: null })}
          color={styles.colors.accent}
        >
          <PlusIcon size={24} color={styles.colors.accent} />
        </VIconButton>
      </div>

      {operationsError && <VBanner type="error" visible message="Не удалось загрузить операции" />}

      {operationsLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: styles.spacing.xl }}>
          <VLoader size={28} />
        </div>
      )}

      {!operationsLoading && operations.length === 0 && (
        <VCard>
          <div style={{ color: styles.colors.textSecondary }}>Операции не найдены</div>
        </VCard>
      )}

      {!operationsLoading && operations.length > 0 && !isGrouped && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.m }}>
          {operations.map((operation) => (
            <OperationCard
              key={operation.id}
              operation={operation}
              pending={Boolean((operation as { _optimistic?: boolean })._optimistic)}
              category={operation.category_id ? categoriesById.get(operation.category_id) : null}
            />
          ))}
        </div>
      )}

      {!operationsLoading && isGrouped && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.m }}>
          {groups.map((group) => {
            const limit = limitsByCategory.get(group.key);
            const groupTotal = group.operations.reduce(
              (sum, op) =>
                sum + signedOperationAmount(op.type as OperationType, Number(op.amount) || 0),
              0,
            );
            const limitAmount = limit ? Number(limit.amount) || 0 : 0;
            const headerValue = limit
              ? formatLimitValue(groupTotal, limitAmount)
              : formatAmount(groupTotal);
            const headerColor = limit
              ? getLimitColor(groupTotal, limitAmount, styles.colors)
              : styles.colors.textPrimary;

            return (
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
                    <span
                      style={{
                        fontWeight: styles.typography.fontWeight.bold,
                        color: headerColor,
                        flexShrink: 0,
                      }}
                    >
                      {headerValue}
                    </span>
                  </span>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.m }}>
                  {group.operations.map((operation) => (
                    <OperationCard
                      key={operation.id}
                      operation={operation}
                      pending={Boolean((operation as { _optimistic?: boolean })._optimistic)}
                      category={
                        operation.category_id ? categoriesById.get(operation.category_id) : null
                      }
                    />
                  ))}
                </div>
              </VAccordion>
            );
          })}
        </div>
      )}
    </div>
  );
};
