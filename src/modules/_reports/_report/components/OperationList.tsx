import { PlusIcon } from '@/shared/icons';
import { useMemo } from 'react';
import { useAuth } from '@/shared/api/authProvider';
import type { Operation, ApiOperationType } from '@/shared/api/types/domain';
import { VAccordion } from '@/shared/ui/VAccordion';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VSkeletonList } from '@/shared/ui/VSkeleton';
import { VToggle } from '@/shared/ui/VToggle';
import { CurrencyText } from '@/shared/ui/Amount';
import { formatAmount } from '@/shared/utils';
import { useCurrency } from '@/shared/api/hooks';
import { useAtom, useSetAtom } from 'jotai';
import { groupedByTypeAtom, operationModalAtom } from '../atoms/report';
import { categoryTypeForOperation } from '../api/categoryTypeForOperation';
import { useCategoryLimits } from '../api/useCategoryLimits';
import { useCategoriesByType } from '../api/useCategories';
import { useAccounts } from '@/shared/api/hooks/useAccounts';
import { useOperations } from '../api/useOperations';
import { OperationCard } from './OperationCard';
import { CategoryLimitsSummary, formatLimitValue, getLimitColor } from './CategoryLimitsSummary';
import styles from './operationList.module.css';

interface OperationListProps {
  reportId: string;
  type: ApiOperationType;
}

export const OperationList = ({ reportId, type }: OperationListProps) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const operationsQuery = useOperations(reportId, type);
  const accountsQuery = useAccounts(userId);
  
  const categoryType = categoryTypeForOperation(type);
  const categoriesQuery = useCategoriesByType(
    categoryType ? userId : '',
    categoryType ?? 'expense',
  );
  const limitsQuery = useCategoryLimits(type === 'expense' ? reportId : '');
  const setModal = useSetAtom(operationModalAtom);
  const [groupedByType, setGroupedByType] = useAtom(groupedByTypeAtom);
  const currency = useCurrency();

  
  const operations = useMemo(() => operationsQuery.data ?? [], [operationsQuery.data]);
  const operationsLoading = operationsQuery.isLoading;
  const operationsError = operationsQuery.error;
  const hasOperationsData = operationsQuery.data != null;
  const categories = categoriesQuery.data ?? [];
  const accounts = accountsQuery.data ?? [];
  const limits = limitsQuery.data ?? [];
  const isTransfer = type === 'transfer';
  
  const isGrouped = !isTransfer && (groupedByType[type] ?? false);

  const toggleGrouping = (next: boolean) => {
    setGroupedByType((prev) => ({ ...prev, [type]: next }));
  };

  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const accountsById = new Map(accounts.map((account) => [account.id, account]));
  const limitsByCategory = new Map(limits.map((limit) => [limit.category_id, limit]));

  const groups = useMemo(() => {
    const result: { key: string; label: string; color?: string; operations: Operation[] }[] = [];

    const byCategory = new Map<string, Operation[]>();
    for (const operation of operations) {
      const key = operation.category_id ?? 'none';
      const list = byCategory.get(key) ?? [];
      list.push(operation);
      byCategory.set(key, list);
    }

    for (const category of categoriesQuery.data ?? []) {
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
    result.sort((a, b) => {
      const totalA = a.operations.reduce((sum, op) => sum + Math.abs(Number(op.amount) || 0), 0);
      const totalB = b.operations.reduce((sum, op) => sum + Math.abs(Number(op.amount) || 0), 0);
      return totalB - totalA;
    });
    const withoutCategory = byCategory.get('none');
    if (withoutCategory) {
      result.push({ key: 'none', label: 'Без категории', operations: withoutCategory });
    }
    return result;
  }, [operations, categoriesQuery.data]);

  return (
    <div className={styles.root}>
      {type === 'expense' && (
        <CategoryLimitsSummary operations={operations} limits={limits} categories={categories} />
      )}

      <div className={styles.toolbar}>
        {!isTransfer && (
          <VToggle
            label="Группировать по категориям"
            checked={isGrouped}
            onChange={toggleGrouping}
          />
        )}
        <VIconButton
          variant="filled"
          ariaLabel="Новая операция"
          className={styles.toolbarAction}
          onClick={() => setModal({ type, operation: null })}
        >
          <PlusIcon size={20} color="currentColor" />
        </VIconButton>
      </div>

      {operationsError && !hasOperationsData && (
        <VErrorCard
          title="Не удалось загрузить операции"
          error={operationsError}
          onRetry={() => void operationsQuery.refetch()}
          isRetrying={operationsQuery.isFetching}
        />
      )}

      {operationsError && hasOperationsData && (
        <VBanner type="error" visible message="Не удалось загрузить операции" />
      )}

      {operationsLoading && (
        <VSkeletonList count={5} cardProps={{ compact: true, title: false, lines: 2 }} />
      )}

      {!operationsLoading && !operationsError && operations.length === 0 && (
        <VCard>
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>
              {type === 'expense' &&
                'Расход — это списание средств. Расход уменьшает баланс, капитал и остаток в рамках периода.'}
              {type === 'income' &&
                'Доход — это поступление средств. Доход увеличивает баланс, капитал и остаток в рамках периода'}
              {type === 'transfer' &&
                'Перевод — это перемещение средств между своими счетами. Перевод не меняет капитал и остаток периода.'}
            </div>
            <div className={styles.emptyHint}>Нажмите «+», чтобы добавить первую операцию.</div>
          </div>
        </VCard>
      )}

      {!operationsLoading && operations.length > 0 && !isGrouped && (
        <div className={styles.list}>
          {operations.map((operation) => (
            <div key={operation.id}>
              <OperationCard
                operation={operation}
                pending={Boolean((operation as { _optimistic?: boolean })._optimistic)}
                category={operation.category_id ? categoriesById.get(operation.category_id) : null}
                account={operation.account_id ? accountsById.get(operation.account_id) : null}
              />
            </div>
          ))}
        </div>
      )}

      {!operationsLoading && isGrouped && (
        <div className={styles.list}>
          {groups.map((group) => {
            const limit = limitsByCategory.get(group.key);
            const groupTotal = group.operations.reduce(
              (sum, op) => sum + (Number(op.amount) || 0),
              0,
            );
            const limitAmount = limit ? Number(limit.amount) || 0 : 0;
            const headerValue = limit
              ? formatLimitValue(groupTotal, limitAmount, currency?.symbol)
              : formatAmount(groupTotal, currency?.symbol);
            const headerColor = limit
              ? getLimitColor(groupTotal, limitAmount)
              : 'var(--md-sys-color-on-surface)';

            return (
              <div key={group.key}>
                <VAccordion
                  header={
                    <span className={styles.accordionHeader}>
                      <span
                        className={styles.accordionDot}
                        style={{
                          backgroundColor: group.color ?? 'var(--md-sys-color-outline-variant)',
                        }}
                      />
                      <span className={styles.accordionLabel}>{group.label}</span>
                      <span className={styles.accordionTotal} style={{ color: headerColor }}>
                        <CurrencyText>{headerValue}</CurrencyText>
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
                        account={
                          operation.account_id ? accountsById.get(operation.account_id) : null
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
