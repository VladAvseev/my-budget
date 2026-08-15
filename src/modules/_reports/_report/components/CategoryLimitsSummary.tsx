import type { Category } from '@/shared/supabase/services/categories';
import type { CategoryLimit } from '@/shared/supabase/services/limits';
import type { Operation } from '@/shared/supabase/services/operations';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount } from '@/shared/utils';
import { useMemo } from 'react';
import styles from './CategoryLimitsSummary.module.css';

export const getLimitColor = (spent: number, limit: number): string => {
  if (spent > limit) return 'var(--color-error)';
  if (spent === limit) return 'var(--color-warning)';
  return 'var(--color-text-primary)';
};

export const formatLimitValue = (spent: number, limit: number): string =>
  `${formatAmount(spent)} / ${formatAmount(limit)}`;

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
            return (
              <div key={limit.id} className={styles.row}>
                <span
                  className={styles.dot}
                  style={{ backgroundColor: category?.color ?? 'var(--color-border)' }}
                />
                <span className={styles.name}>{category?.name ?? 'Категория'}</span>
                <div className={styles.value} style={{ color }}>
                  {formatLimitValue(spent, limitAmount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VCard>
  );
};