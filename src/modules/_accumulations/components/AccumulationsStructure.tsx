import type { Category } from '@/shared/supabase/services/categories';
import { HIDDEN_AMOUNT } from '@/shared/hooks';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount } from '@/shared/utils';
import commonStyles from '@/shared/styles/common.module.css';
import styles from './AccumulationsStructure.module.css';

export interface AccumulationsStructureItem {
  categoryId: string | null;
  amount: number;
}

interface AccumulationsStructureProps {
  items: AccumulationsStructureItem[];
  categories: Category[];
  hideRing?: boolean;
  title?: string;
  maskAmounts?: boolean;
  interactive?: boolean;
}

interface CategorySegment {
  key: string;
  label: string;
  color: string;
  total: number;
  percent: number;
  start: number;
  end: number;
}

export const AccumulationsStructure = ({
  items,
  categories,
  hideRing = false,
  title = 'Структура накоплений',
  maskAmounts = false,
  interactive = false,
}: AccumulationsStructureProps) => {
  const categoriesById = new Map(categories.map((category) => [category.id, category]));

  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const groupedTotals = new Map<string, { label: string; color: string; total: number }>();
  for (const item of items) {
    const category = item.categoryId ? categoriesById.get(item.categoryId) : null;
    const key = category ? category.id : 'none';
    const value = Number(item.amount) || 0;
    const existing = groupedTotals.get(key);
    if (existing) {
      existing.total += value;
    } else {
      groupedTotals.set(key, {
        label: category ? category.name : 'Без категории',
        color: category?.color ?? 'var(--color-border)',
        total: value,
      });
    }
  }

  const segments: CategorySegment[] = [];
  let cursor = 0;
  const sortedGroups = [...groupedTotals.entries()].sort((a, b) => b[1].total - a[1].total);
  for (const [key, group] of sortedGroups) {
    const percent = total > 0 ? (group.total / total) * 100 : 0;
    segments.push({
      key,
      label: group.label,
      color: group.color,
      total: group.total,
      percent,
      start: cursor,
      end: cursor + percent,
    });
    cursor += percent;
  }

  const gradient = segments
    .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
    .join(', ');

  return (
    <div className={commonStyles.animateCard}>
      <VCard
        interactive={interactive}
        style={{ height: interactive ? '100%' : undefined }}
      >
        <div className={styles.content}>
          <div className={styles.title}>{title}</div>

          {segments.length === 0 && <div className={styles.message}>Накоплений нет</div>}

          {segments.length > 0 && total <= 0 && (
            <div className={styles.message}>Доли накоплений невозможно отобразить</div>
          )}

          {segments.length > 0 && (
            <div className={styles.body}>
              {!hideRing && total > 0 && (
                <div
                  className={styles.ring}
                  style={{ ['--ring-gradient' as string]: `conic-gradient(${gradient})` }}
                >
                  <div className={styles.ringHole} />
                </div>
              )}

              <div
                className={`${styles.legend}${hideRing ? ` ${styles.legendFull}` : ''}`}
              >
                <span className={`${styles.dot} ${styles.dotAccent}`} />
                <span className={styles.textBold}>Всего</span>
                <span className={`${styles.textMedium} ${styles.justifyEnd}`}>100%</span>
                <span className={`${styles.textBold} ${styles.justifyEnd}`}>
                  {maskAmounts ? HIDDEN_AMOUNT : formatAmount(total)}
                </span>

                {segments.flatMap((segment) => [
                  <span
                    key={`${segment.key}-dot`}
                    className={`${styles.dot} ${styles.dotSegment}`}
                    style={{ ['--segment-color' as string]: segment.color }}
                  />,
                  <span key={`${segment.key}-label`} className={styles.ellipsis}>
                    {segment.label}
                  </span>,
                  <span key={`${segment.key}-percent`} className={`${styles.textMedium} ${styles.justifyEnd}`}>
                    {segment.percent.toFixed(1)}%
                  </span>,
                  <span key={`${segment.key}-amount`} className={`${styles.textBold} ${styles.justifyEnd}`}>
                    {maskAmounts ? HIDDEN_AMOUNT : formatAmount(segment.total)}
                  </span>,
                ])}
              </div>
            </div>
          )}
        </div>
      </VCard>
    </div>
  );
};