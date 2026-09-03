import { useState, useMemo } from 'react';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { VButtonGroup } from '@/shared/ui/VButtonGroup';
import { formatAmount } from '@/shared/utils';
import { useOverviewCategories } from '../api/useOverviewCategories';
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
      <VCard className={styles.content}>
        <div className={styles.loaderWrap}>
          <VLoader size={28} />
        </div>
      </VCard>
    );
  }

  const { segments, total, hasNegative } = chartData;

  return (
    <VCard className={styles.content}>
      <VButtonGroup options={typeOptions} value={selectedType} onChange={setSelectedType} />

      {segments.length === 0 || hasNegative || total <= 0 ? (
        <div className={styles.message}>
          {hasNegative ? 'Доли категорий невозможно отобразить' : 'Нет данных для отображения'}
        </div>
      ) : (
        <div className={styles.chartWrapper}>
          <div
            className={styles.ring}
            style={{
              ['--chart-gradient' as string]: `conic-gradient(${segments
                .map((s) => `${s.color} ${s.start}% ${s.end}%`)
                .join(', ')})`,
            }}
          >
            <div className={styles.ringHole}>
              <span className={styles.ringTotal}>{formatAmount(total)}</span>
            </div>
          </div>

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
                {formatAmount(segment.total)}
              </span>,
            ])}
          </div>
        </div>
      )}
    </VCard>
  );
};
