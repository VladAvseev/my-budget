import { PlusIcon } from '@/shared/icons';
import { useMemo } from 'react';
import { useAuth } from '@/shared/supabase/authProvider';
import type { Operation, OperationType } from '@/shared/supabase/types/domain';
import { VAccordion } from '@/shared/ui/VAccordion';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VLoader } from '@/shared/ui/VLoader';
import { VToggle } from '@/shared/ui/VToggle';
import { formatAmount } from '@/shared/utils';
import { useCurrency } from '@/shared/hooks';
import commonStyles from '@/shared/styles/common.module.css';
import { useAtom, useSetAtom } from 'jotai';
import { groupedByTypeAtom, operationModalAtom } from '../atoms/report';
import { categoryTypeForOperation } from '../api/categoryTypeForOperation';
import { useCategoryLimits } from '../api/useCategoryLimits';
import { useCategories } from '../api/useCategories';
import { useOperations, useSavingsReportOperations } from '../api/useOperations';
import { OperationCard } from './OperationCard';
import { CategoryLimitsSummary, formatLimitValue, getLimitColor } from './CategoryLimitsSummary';
import { isSavingsType, signedOperationAmount } from '@/shared/supabase/types/domain';
import styles from './operationList.module.css';

interface OperationListProps {
  reportId: string;
  type: OperationType;
}

export const OperationList = ({ reportId, type }: OperationListProps) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const operationsQuery = useOperations(reportId, type);
  const savingsQueries = useSavingsReportOperations(reportId, isSavingsType(type));
  const isSavings = isSavingsType(type);
  const categoriesQuery = useCategories(userId, categoryTypeForOperation(type));
  const limitsQuery = useCategoryLimits(type === 'expense' ? reportId : '');
  const setModal = useSetAtom(operationModalAtom);
  const [groupedByType, setGroupedByType] = useAtom(groupedByTypeAtom);
  const currency = useCurrency();

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

    const byCategory = new Map<string, Operation[]>();
    for (const operation of queryOperations) {
      const key = operation.category_id ?? 'none';
      const list = byCategory.get(key) ?? [];
      list.push(operation);
      byCategory.set(key, list);
    }

    for (const category of queryCategories) {
      const grouped = byCategory.get(category.id);
      if (grouped) {
        result.push({
          key: category.id,
          label: category.name,
          color: category.color ?? undefined,
          operations: grouped,
        });
      }
    }
    const withoutCategory = byCategory.get('none');
    if (withoutCategory) {
      result.push({ key: 'none', label: 'Без категории', operations: withoutCategory });
    }
    return result;
  }, [isSavings, operations, operationsQuery.data, categoriesQuery.data]);

  return (
    <div className={styles.root}>
      {type === 'expense' && (
        <CategoryLimitsSummary operations={operations} limits={limits} categories={categories} />
      )}

      <div className={styles.toolbar}>
        <VToggle label="Группировать по категориям" checked={isGrouped} onChange={toggleGrouping} />
        <VIconButton
          ariaLabel="Новая операция"
          onClick={() => setModal({ type, operation: null })}
          color="var(--color-accent)"
        >
          <PlusIcon size={24} color="currentColor" />
        </VIconButton>
      </div>

      {operationsError && <VBanner type="error" visible message="Не удалось загрузить операции" />}

      {operationsLoading && (
        <div className={styles.loaderWrap}>
          <VLoader size={28} />
        </div>
      )}

      {!operationsLoading && operations.length === 0 && (
        <VCard>
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>
              {type === 'expense' && 'Расход — это списание средств. Расход уменьшает баланс, капитал и остаток в рамках отчёта.'}
              {type === 'income' && 'Доход — это поступление средств. Доход увеличивает баланс, капитал и остаток в рамках отчёта'}
              {type === 'savings' && 'Накопление — это отложенная сумма средств, которая учитывается отдельно от расходов и доходов. Накопления влияют на общую сумму накоплений в разделе "Накопления".'}
            </div>
            <div className={styles.emptyHint}>Нажмите «+», чтобы добавить первую операцию.</div>
          </div>
        </VCard>
      )}

      {!operationsLoading && operations.length > 0 && !isGrouped && (
        <div className={styles.list}>
          {operations.map((operation, index) => (
            <div
              key={operation.id}
              className={commonStyles.animateCard}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <OperationCard
                operation={operation}
                pending={Boolean((operation as { _optimistic?: boolean })._optimistic)}
                category={operation.category_id ? categoriesById.get(operation.category_id) : null}
              />
            </div>
          ))}
        </div>
      )}

      {!operationsLoading && isGrouped && (
        <div className={styles.list}>
          {groups.map((group, groupIndex) => {
            const limit = limitsByCategory.get(group.key);
            const groupTotal = group.operations.reduce(
              (sum, op) =>
                sum + signedOperationAmount(op.type as OperationType, Number(op.amount) || 0),
              0,
            );
            const limitAmount = limit ? Number(limit.amount) || 0 : 0;
            const headerValue = limit
              ? formatLimitValue(groupTotal, limitAmount, currency?.symbol)
              : formatAmount(groupTotal, currency?.symbol);
            const headerColor = limit
              ? getLimitColor(groupTotal, limitAmount)
              : 'var(--color-text-primary)';

            return (
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
                      <span className={styles.accordionTotal} style={{ color: headerColor }}>
                        {headerValue}
                      </span>
                    </span>
                  }
                >
                  <div className={styles.list}>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};