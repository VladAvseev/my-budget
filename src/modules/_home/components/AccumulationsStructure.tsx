import type { Category } from '@/shared/supabase/services/categories';
import { HIDDEN_AMOUNT } from '@/shared/hooks';
import { useThemeStyles } from '@/shared/theme';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount } from '@/shared/utils';

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

const RING_SIZE = 200;
const HOLE_SIZE = 120;

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
  const styles = useThemeStyles();
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
        color: category?.color ?? styles.colors.border,
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
    <VCard
      interactive={interactive}
      style={{
        height: interactive ? '100%' : undefined,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: styles.spacing.l,
        }}
      >
        <div
          style={{
            fontSize: styles.typography.fontSize.xl,
            fontWeight: styles.typography.fontWeight.bold,
            color: styles.colors.textPrimary,
          }}
        >
          {title}
        </div>

        {segments.length === 0 && (
          <div style={{ color: styles.colors.textSecondary }}>Накоплений нет</div>
        )}

        {segments.length > 0 && total <= 0 && (
          <div style={{ color: styles.colors.textSecondary }}>
            Доли накоплений невозможно отобразить
          </div>
        )}

        {segments.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: styles.spacing.xl,
            }}
          >
            {!hideRing && total > 0 && (
              <div
                style={{
                  position: 'relative',
                  width: RING_SIZE,
                  height: RING_SIZE,
                  borderRadius: styles.radius.round,
                  background: `conic-gradient(${gradient})`,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: HOLE_SIZE,
                    height: HOLE_SIZE,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: styles.radius.round,
                    backgroundColor: styles.colors.bgSurface,
                  }}
                />
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '16px minmax(0, 1fr) 56px 104px',
                alignItems: 'center',
                columnGap: styles.spacing.m,
                rowGap: styles.spacing.m,
                width: hideRing ? '100%' : 'fit-content',
                maxWidth: '100%',
                minWidth: 200,
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: styles.radius.round,
                  backgroundColor: styles.colors.accent,
                  boxShadow: styles.shadow.s,
                }}
              />
              <span
                style={{
                  fontSize: styles.typography.fontSize.m,
                  fontWeight: styles.typography.fontWeight.bold,
                  color: styles.colors.textPrimary,
                }}
              >
                Всего
              </span>
              <span
                style={{
                  justifySelf: 'end',
                  fontSize: styles.typography.fontSize.m,
                  fontWeight: styles.typography.fontWeight.medium,
                  color: styles.colors.textSecondary,
                }}
              >
                100%
              </span>
              <span
                style={{
                  justifySelf: 'end',
                  fontSize: styles.typography.fontSize.m,
                  fontWeight: styles.typography.fontWeight.bold,
                  color: styles.colors.textPrimary,
                }}
              >
                {maskAmounts ? HIDDEN_AMOUNT : formatAmount(total)}
              </span>

              {segments.flatMap((segment) => [
                <span
                  key={`${segment.key}-dot`}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: styles.radius.round,
                    backgroundColor: segment.color,
                  }}
                />,
                <span
                  key={`${segment.key}-label`}
                  style={{
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: styles.typography.fontSize.m,
                    color: styles.colors.textPrimary,
                  }}
                >
                  {segment.label}
                </span>,
                <span
                  key={`${segment.key}-percent`}
                  style={{
                    justifySelf: 'end',
                    fontSize: styles.typography.fontSize.m,
                    fontWeight: styles.typography.fontWeight.medium,
                    color: styles.colors.textSecondary,
                  }}
                >
                  {segment.percent.toFixed(1)}%
                </span>,
                <span
                  key={`${segment.key}-amount`}
                  style={{
                    justifySelf: 'end',
                    fontSize: styles.typography.fontSize.m,
                    fontWeight: styles.typography.fontWeight.bold,
                    color: styles.colors.textPrimary,
                  }}
                >
                  {maskAmounts ? HIDDEN_AMOUNT : formatAmount(segment.total)}
                </span>,
              ])}
            </div>
          </div>
        )}
      </div>
    </VCard>
  );
};