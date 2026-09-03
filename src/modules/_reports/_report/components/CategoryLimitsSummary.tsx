import type { Category, CategoryLimit, Operation } from '@/shared/supabase/types/domain';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount } from '@/shared/utils';
import { useCurrency } from '@/shared/hooks';
import { useMemo } from 'react';
import styles from './CategoryLimitsSummary.module.css';

export const getLimitColor = (spent: number, limit: number): string => {
  if (spent > limit) return 'var(--color-error)';
  if (spent === limit) return 'var(--color-warning)';
  return 'var(--color-text-primary)';
};

export const formatLimitValue = (spent: number, limit: number, currencySymbol?: string | null): string =>
  `${formatAmount(spent, currencySymbol)} / ${formatAmount(limit, currencySymbol)}`;

interface CategoryLimitsSummaryProps {
  operations: Operation[];
  limits: CategoryLimit[];
  categories: Category[];
}

export const CategoryLimitsSummary = ({
  operations,
  limits,
  categories,
}: CategoryLimitsSummaryProps) => {
  const currency = useCurrency();
  const spentByCategory = useMemo(() => {
    const result = new Map<string, number>();
    for (const operation of operations) {
      if (!operation.category_id) continue;
      const value = Number(operation.amount) || 0;
      result.set(operation.category_id, (result.get(operation.category_id) ?? 0) + value);
    }
    return result;
  }, [operations]);

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  if (limits.length === 0) {
    return null;
  }

  return (
    <VCard>
      <div className={styles.content}>
        <div className={styles.list}>
          {limits.map((limit) => {
            const spent = spentByCategory.get(limit.category_id) ?? 0;
            const limitAmount = Number(limit.amount) || 0;
            const color = getLimitColor(spent, limitAmount);
            const category = categoriesById.get(limit.category_id);
            const percentage = limitAmount > 0 ? Math.round((spent / limitAmount) * 100) : 0;
            const barColor =
              spent > limitAmount
                ? 'var(--color-error)'
                : spent === limitAmount
                  ? 'var(--color-warning)'
                  : 'var(--color-success)';
            return (
              <div key={limit.id} className={styles.rowItem}>
                <div className={styles.row}>
                  <div className={styles.rowLabel}>
                    <span
                      className={styles.dot}
                      style={{ backgroundColor: category?.color ?? 'var(--color-border)' }}
                    />
                    <span className={styles.name}>{category?.name ?? 'Категория'}</span>
                    <div className={styles.value} style={{ color }}>
                      {formatLimitValue(spent, limitAmount, currency?.symbol)}
                    </div>
                  </div>
                  <span className={styles.percent}>{percentage}%</span>
                </div>
                <div className={styles.bar}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${percentage}%`, backgroundColor: barColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VCard>
  );
};
