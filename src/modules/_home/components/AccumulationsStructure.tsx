import { useCurrency, type BootstrapSavingsItem } from '@/shared/api/hooks';
import { formatAmount } from '@/shared/utils';
import styles from './AccumulationsStructure.module.css';

interface CategorySegment {
  key: string;
  label: string;
  color: string;
  total: number;
  percent: number;
  start: number;
  end: number;
}

interface AccumulationsLegendProps {
  /** Агрегат из bootstrap: сумма по категории уже посчитана сервером. */
  items: BootstrapSavingsItem[];
  fullWidth?: boolean;
}

const buildSegments = (items: BootstrapSavingsItem[]): { segments: CategorySegment[]; total: number } => {
  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const sorted = [...items].sort((a, b) => b.amount - a.amount);
  const segments: CategorySegment[] = [];
  let cursor = 0;
  for (const item of sorted) {
    const value = Number(item.amount) || 0;
    const percent = total > 0 ? (value / total) * 100 : 0;
    segments.push({
      key: item.categoryId ?? 'none',
      label: item.name ?? 'Без категории',
      color: item.color ?? 'var(--color-border)',
      total: value,
      percent,
      start: cursor,
      end: cursor + percent,
    });
    cursor += percent;
  }

  return { segments, total };
};

export const AccumulationsLegend = ({
  items,
  fullWidth = false,
}: AccumulationsLegendProps) => {
  const { segments } = buildSegments(items);
  const currency = useCurrency();

  return (
    <div className={`${styles.legend}${fullWidth ? ` ${styles.legendFull}` : ''}`}>
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
        <span key={`${segment.key}-amount`} className={`${styles.textBold} ${styles.justifyEnd}`}>
          {formatAmount(segment.total, currency?.symbol)}
        </span>,
      ])}
    </div>
  );
};
