import { CurrencyText } from '@/shared/ui/Amount';
import type { Category, Operation, Report } from '@/shared/api/types/domain';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount } from '@/shared/utils';
import { parseISO } from '@/shared/utils/date';
import { useCurrency } from '@/shared/api/hooks';
import { useMemo } from 'react';
import styles from './CategoryBudgetsSummary.module.css';

const DAY_MS = 86_400_000;

// Остаток дней просматриваемого периода для дневного лимита:
// - сегодня внутри периода — от сегодня до конца включительно;
// - период в будущем — полная длина периода включительно;
// - период прошёл или даты некорректны — null (дневной остаток не показываем).
export const getDaysLeft = (
  periodStart: string | null,
  periodEnd: string | null,
): number | null => {
  const start = periodStart ? parseISO(periodStart) : null;
  const end = periodEnd ? parseISO(periodEnd) : null;
  if (!start || !end || start.getTime() > end.getTime()) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  if (today.getTime() > endDay.getTime()) return null;
  const from = today.getTime() < startDay.getTime() ? startDay : today;
  return Math.round((endDay.getTime() - from.getTime()) / DAY_MS) + 1;
};

export const getBudgetColor = (spent: number, limit: number): string => {
  if (spent > limit) return 'var(--md-sys-color-error)';
  if (spent === limit) return 'var(--sys-color-caution-ink)';
  return 'var(--md-sys-color-on-surface)';
};

export const formatBudgetValue = (
  spent: number,
  limit: number,
  currencySymbol?: string | null,
): string => `${formatAmount(spent, currencySymbol)} / ${formatAmount(limit, currencySymbol)}`;

export const formatDailyValue = (
  limit: number,
  daysLeft: number,
  currencySymbol?: string | null,
): string | null => {
  if (daysLeft <= 0) return null;
  const daily = limit / daysLeft;
  if (!(daily > 0)) return null;
  return formatAmount(daily, currencySymbol);
};

interface CategoryBudgetsSummaryProps {
  operations: Operation[];
  categories: Category[];
  report: Report | null;
}

export const CategoryBudgetsSummary = ({
  operations,
  categories,
  report,
}: CategoryBudgetsSummaryProps) => {
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

  const budgeted = useMemo(
    () =>
      categories.filter(
        (category) => category.limit_amount != null && Number(category.limit_amount) > 0,
      ),
    [categories],
  );

  const daysLeft = useMemo(
    () => (report ? getDaysLeft(report.period_start, report.period_end) : null),
    [report],
  );

  if (budgeted.length === 0) {
    return null;
  }

  return (
    <VCard>
      <div className={styles.content}>
        <div className={styles.list}>
          {budgeted.map((category) => {
            const spent = spentByCategory.get(category.id) ?? 0;
            const limitAmount = Number(category.limit_amount) || 0;
            const color = getBudgetColor(spent, limitAmount);
            const percentage = limitAmount > 0 ? Math.round((spent / limitAmount) * 100) : 0;
            const barColor =
              spent > limitAmount
                ? 'var(--md-sys-color-error)'
                : spent === limitAmount
                  ? 'var(--sys-color-caution-ink)'
                  : 'var(--sys-color-positive-ink)';
            const daily =
              category.show_daily_limit && daysLeft != null
                ? formatDailyValue(limitAmount, daysLeft, currency?.symbol)
                : null;
            return (
              <div key={category.id} className={styles.rowItem}>
                <div className={styles.row}>
                  <div className={styles.rowLabel}>
                    <span
                      className={styles.dot}
                      style={{
                        backgroundColor: category?.color ?? 'var(--md-sys-color-outline-variant)',
                      }}
                    />
                    <span className={styles.name}>{category?.name ?? 'Категория'}</span>
                    <div className={styles.value} style={{ color }}>
                      <CurrencyText>
                        {formatBudgetValue(spent, limitAmount, currency?.symbol)}
                      </CurrencyText>
                      {daily != null && (
                        <span className={styles.daily}>
                          <CurrencyText>{`${daily} в день`}</CurrencyText>
                        </span>
                      )}
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
