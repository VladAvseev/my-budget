import type { Category } from '@/shared/supabase/services/categories';
import type { CategoryLimit } from '@/shared/supabase/services/limits';
import type { Operation } from '@/shared/supabase/services/operations';
import { useThemeStyles } from '@/shared/theme';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount } from '@/shared/utils';
import { useMemo } from 'react';

export const getLimitColor = (
  spent: number,
  limit: number,
  colors: ReturnType<typeof useThemeStyles>['colors'],
): string => {
  if (spent > limit) return colors.error;
  if (spent === limit) return colors.warning;
  return colors.textPrimary;
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
  const styles = useThemeStyles();

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
        <div
          style={{
            fontSize: styles.typography.fontSize.l,
            fontWeight: styles.typography.fontWeight.bold,
            color: styles.colors.textPrimary,
          }}
        >
          Сводка
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: styles.spacing.s,
          }}
        >
          {limits.map((limit) => {
            const spent = spentByCategory.get(limit.category_id) ?? 0;
            const limitAmount = Number(limit.amount) || 0;
            const color = getLimitColor(spent, limitAmount, styles.colors);
            const category = categoriesById.get(limit.category_id);
            return (
              <div
                key={limit.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: styles.spacing.s,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    flexShrink: 0,
                    borderRadius: styles.radius.round,
                    backgroundColor: category?.color ?? styles.colors.border,
                  }}
                />
                <span
                  style={{
                    fontSize: styles.typography.fontSize.s,
                    color: styles.colors.textSecondary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {category?.name ?? 'Категория'}
                </span>
                <div
                  style={{
                    fontSize: styles.typography.fontSize.l,
                    fontWeight: styles.typography.fontWeight.bold,
                    color,
                  }}
                >
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
