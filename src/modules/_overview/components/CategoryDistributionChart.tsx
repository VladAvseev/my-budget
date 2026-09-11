import { useState, useMemo } from 'react';
import { VCard } from '@/shared/ui/VCard';
import { VSkeleton } from '@/shared/ui/VSkeleton';
import { VButtonGroup } from '@/shared/ui/VButtonGroup';
import { DonutChart, type DonutSegment } from '@/shared/ui/DonutChart';
import { formatAmount, convertAmount } from '@/shared/utils';
import { useOverviewCategories } from '../api/useOverviewCategories';
import { useDisplayCurrency } from '../hooks/useDisplayCurrency';
import { buildChartData, type ChartData } from '../utils/overview';
import styles from './CategoryDistributionChart.module.css';

interface CategoryDistributionChartProps {
  operationsByReport: Map<
    string,
    Array<{ type: string; amount: string; category_id: string | null }>
  >;
}

const typeOptions: Array<{ value: 'expense' | 'income' | 'savings'; label: string }> = [
  { value: 'expense', label: 'Расходы' },
  { value: 'income', label: 'Доходы' },
  { value: 'savings', label: 'Накопления' },
];

export const CategoryDistributionChart = ({
  operationsByReport,
}: CategoryDistributionChartProps) => {
  const [selectedType, setSelectedType] = useState<'expense' | 'income' | 'savings'>('expense');
  const { displaySymbol, convertOptions } = useDisplayCurrency();

  const { expenseCategories, incomeCategories, savingsCategories } = useOverviewCategories();

  const categories = useMemo(() => {
    switch (selectedType) {
      case 'expense':
        return expenseCategories.data ?? [];
      case 'income':
        return incomeCategories.data ?? [];
      case 'savings':
        return savingsCategories.data ?? [];
    }
  }, [selectedType, expenseCategories.data, incomeCategories.data, savingsCategories.data]);

  const loading = useMemo(() => {
    switch (selectedType) {
      case 'expense':
        return expenseCategories.isLoading;
      case 'income':
        return incomeCategories.isLoading;
      case 'savings':
        return savingsCategories.isLoading;
    }
  }, [
    selectedType,
    expenseCategories.isLoading,
    incomeCategories.isLoading,
    savingsCategories.isLoading,
  ]);

  const chartData: ChartData = useMemo(() => {
    let typeFilter: Array<'expense' | 'income' | 'savings' | 'savings_out' | 'daily'>;
    let includeDaily = false;

    switch (selectedType) {
      case 'expense':
        typeFilter = ['expense'];
        includeDaily = true;
        break;
      case 'income':
        typeFilter = ['income'];
        break;
      case 'savings':
        typeFilter = ['savings', 'savings_out'];
        break;
    }

    return buildChartData(operationsByReport as any, typeFilter, categories, includeDaily);
  }, [selectedType, operationsByReport, categories]);

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
      <div className={styles.title}>Структура операций</div>

      <VButtonGroup options={typeOptions} value={selectedType} onChange={setSelectedType} />

      {segments.length === 0 || hasNegative || total <= 0 ? (
        <div className={styles.message}>
          {hasNegative ? 'Доли категорий невозможно отобразить' : 'Нет данных для отображения'}
        </div>
      ) : (
        <div className={styles.chartWrapper}>
          <DonutChart
            segments={donutSegments}
            total={total}
            displayTotal={convertedTotal}
            displaySymbol={displaySymbol}
          />

          <div className={styles.legend}>
            {donutSegments.flatMap((segment) => [
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
                {formatAmount(segment.total, displaySymbol, convertOptions)}
              </span>,
            ])}
          </div>
        </div>
      )}
    </VCard>
  );
};
