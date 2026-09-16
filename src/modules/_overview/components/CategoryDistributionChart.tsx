import { Amount } from '@/shared/ui/Amount';
import { useState, useMemo } from 'react';
import { VCard } from '@/shared/ui/VCard';
import { VSkeleton } from '@/shared/ui/VSkeleton';
import { VButtonGroup } from '@/shared/ui/VButtonGroup';
import { DonutChart, type DonutSegment } from '@/shared/ui/DonutChart';
import { convertAmount } from '@/shared/utils';
import type { CategorySummaryRow } from '../api/useOverviewCategorySummary';
import { useOverviewCategories } from '../api/useOverviewCategories';
import { useDisplayCurrency } from '../hooks/useDisplayCurrency';
import { buildChartData, type ChartData } from '../utils/overview';
import styles from './CategoryDistributionChart.module.css';

interface CategoryDistributionChartProps {
  summaryByReport: Map<string, CategorySummaryRow[]>;
}

const typeOptions: Array<{ value: 'expense' | 'income'; label: string }> = [
  { value: 'expense', label: 'Расходы' },
  { value: 'income', label: 'Доходы' },
];

export const CategoryDistributionChart = ({ summaryByReport }: CategoryDistributionChartProps) => {
  const [selectedType, setSelectedType] = useState<'expense' | 'income'>('expense');
  const { displaySymbol, convertOptions } = useDisplayCurrency();

  const { expenseCategories, incomeCategories, isLoading: loading } = useOverviewCategories();

  const categories = useMemo(() => {
    switch (selectedType) {
      case 'expense':
        return expenseCategories;
      case 'income':
        return incomeCategories;
    }
  }, [selectedType, expenseCategories, incomeCategories]);

  const chartData: ChartData = useMemo(() => {
    let typeFilter: Array<'expense' | 'income'>;

    switch (selectedType) {
      case 'expense':
        typeFilter = ['expense'];
        break;
      case 'income':
        typeFilter = ['income'];
        break;
    }

    return buildChartData(summaryByReport, typeFilter, categories);
  }, [selectedType, summaryByReport, categories]);

  if (loading) {
    return (
      <VCard className={styles.content} aria-busy="true">
        <VSkeleton width={220} height={24} />
        <VSkeleton width="60%" height={38} />
        <div className={styles.skeletonChart}>
          <VSkeleton circle width={220} height={220} />
          <div className={styles.skeletonLegend}>
            {[0, 1, 2, 3].map((i) => (
              <VSkeleton key={i} height={18} />
            ))}
          </div>
        </div>
      </VCard>
    );
  }

  const { segments, total, hasNegative } = chartData;

  const donutSegments: DonutSegment[] = segments.map((segment) => ({
    ...segment,
    convertedTotal: convertOptions
      ? convertAmount(segment.total, convertOptions.from, convertOptions.to, convertOptions.rates)
      : undefined,
  }));

  const convertedTotal = donutSegments.reduce(
    (sum, seg) => sum + (seg.convertedTotal ?? seg.total),
    0,
  );

  return (
    <VCard className={styles.content}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Структура операций</h2>

        <VButtonGroup options={typeOptions} value={selectedType} onChange={setSelectedType} />
      </div>

      {segments.length === 0 || hasNegative || total <= 0 ? (
        <div className={styles.message}>
          {hasNegative ? 'Доли категорий невозможно отобразить' : 'Нет данных для отображения'}
        </div>
      ) : (
        <div className={styles.chartWrapper}>
          <div className={styles.diagram}>
            <DonutChart
              segments={donutSegments}
              total={total}
              displayTotal={convertedTotal}
              displaySymbol={displaySymbol}
            />
          </div>

          <ul className={styles.legend}>
            {donutSegments.map((segment) => (
              <li key={segment.key} className={styles.legendRow}>
                <span
                  className={styles.dot}
                  aria-hidden="true"
                  style={{ ['--segment-color' as string]: segment.color }}
                />
                <span className={styles.categoryName}>{segment.label}</span>
                <span className={styles.percent}>{segment.percent.toFixed(1)}%</span>
                <span className={styles.amount}>
                  <Amount
                    value={segment.total}
                    currencySymbol={displaySymbol}
                    convert={convertOptions}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </VCard>
  );
};
