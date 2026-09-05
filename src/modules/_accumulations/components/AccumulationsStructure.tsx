
import { useState } from 'react';
import type { Category } from '@/shared/supabase/types/domain';
import { HIDDEN_AMOUNT, useCurrency, useExchangeRates } from '@/shared/hooks';
import { QUICK_CURRENCIES, getCurrencyByCode } from '@/shared/constants/currencies';
import { VCard } from '@/shared/ui/VCard';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { DonutChart, type DonutSegment } from '@/shared/ui/DonutChart';
import { convertAmount, formatAmount } from '@/shared/utils';
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
  profileCurrency?: string | null;
}

interface CategorySegment {
  key: string;
  label: string;
  color: string;
  total: number;
  convertedTotal?: number;
  percent: number;
  start: number;
  end: number;
}

const CURRENCY_OPTIONS: VButtonGroupOption[] = [
  { value: 'BYN', label: 'BYN' },
  { value: 'RUB', label: 'RUB' },
  { value: 'USD', label: 'USD' },
];

const isQuickCurrency = (code: string | null): code is string =>
  code !== null && (QUICK_CURRENCIES as readonly string[]).includes(code);

export const AccumulationsStructure = ({
  items,
  categories,
  hideRing = false,
  title = 'Структура накоплений',
  maskAmounts = false,
  interactive = false,
  profileCurrency = null,
}: AccumulationsStructureProps) => {
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const currency = useCurrency();

  const defaultCurrency = isQuickCurrency(profileCurrency) ? profileCurrency : null;
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(defaultCurrency);
  const { data: rates } = useExchangeRates();

  const isDisabled = !isQuickCurrency(profileCurrency);

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

  const displayCurrency = selectedCurrency && rates ? selectedCurrency : null;
  const displaySymbol = displayCurrency ? getCurrencyByCode(displayCurrency)?.symbol : currency?.symbol;

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
      convertedTotal:
        displayCurrency && rates && defaultCurrency
          ? convertAmount(group.total, defaultCurrency, displayCurrency, rates)
          : undefined,
      percent,
      start: cursor,
      end: cursor + percent,
    });
    cursor += percent;
  }

  const donutSegments: DonutSegment[] = segments;
  const convertedTotal = segments.reduce((sum, seg) => sum + (seg.convertedTotal ?? seg.total), 0);

  const formatSegmentAmount = (segment: CategorySegment) => {
    if (maskAmounts) return HIDDEN_AMOUNT;
    return formatAmount(segment.convertedTotal ?? segment.total, displaySymbol ?? currency?.symbol);
  };

  return (
    <div className={commonStyles.animateCard}>
      <VCard interactive={interactive} className={styles.mobileCompact} style={{ height: interactive ? '100%' : undefined }}>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.title}>{title}</div>
            <div title={isDisabled ? 'Сначала выберите валюту в профиле' : undefined}>
              <VButtonGroup
                options={CURRENCY_OPTIONS}
                value={selectedCurrency}
                onChange={(value) => setSelectedCurrency(value as string)}
                disabled={isDisabled}
              />
            </div>
          </div>

          {segments.length === 0 && <div className={styles.message}>Накоплений нет</div>}

          {segments.length > 0 && total <= 0 && (
            <div className={styles.message}>Доли начальных накоплений невозможно отобразить</div>
          )}

          {segments.length > 0 && (
            <div className={styles.body}>
              {!hideRing && total > 0 && (
                <DonutChart
                  segments={donutSegments}
                  total={total}
                  maskAmounts={maskAmounts}
                  displayTotal={convertedTotal}
                  displaySymbol={displaySymbol}
                />
              )}

              <div className={styles.legend}>
                {segments.flatMap((segment) => [
                  <span
                    key={`${segment.key}-dot`}
                    className={`${styles.dot} ${styles.dotSegment}`}
                    style={{ ['--segment-color' as string]: segment.color }}
                  />,
                  <span key={`${segment.key}-label`} className={styles.ellipsis}>
                    {segment.label}
                  </span>,
                  <span
                    key={`${segment.key}-percent`}
                    className={`${styles.textMedium} ${styles.justifyEnd}`}
                  >
                    {segment.percent.toFixed(1)}%
                  </span>,
                  <span
                    key={`${segment.key}-amount`}
                    className={`${styles.textBold} ${styles.justifyEnd}`}
                  >
                    {formatSegmentAmount(segment)}
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
