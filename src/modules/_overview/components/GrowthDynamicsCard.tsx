import { useMemo, useState } from 'react';
import { useAccounts, useCapitalDynamics } from '@/shared/api/hooks';
import { convertAmount } from '@/shared/utils';
import {
  aggregatePoints,
  toPeriodDeltas,
  type ChartPoint,
  type GrowthAggregation,
} from '@/shared/utils/chartPoints';
import { VGrowthDynamicsCard } from '@/shared/ui/VGrowthDynamicsCard';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import commonStyles from '@/shared/styles/common.module.css';
import { buildCapitalChartData, type GrowthChartMode } from '../utils/buildCapitalChartData';
import { buildGrowthStats } from '../utils/buildGrowthStats';

export interface GrowthDynamicsCardCurrency {
  displayCurrency: string | null;
  defaultCurrency: string | null;
  rates?: Record<string, number> | null;
  displaySymbol?: string;
}

interface GrowthDynamicsCardProps {
  userId: string;
  title: string;
  currency: GrowthDynamicsCardCurrency;
}

const EMPTY_ARRAY: never[] = [];

export const GrowthDynamicsCard = ({ userId, title, currency }: GrowthDynamicsCardProps) => {
  const [mode, setMode] = useState<GrowthChartMode>('total');
  const [aggregation, setAggregation] = useState<GrowthAggregation>('M');

  const { displayCurrency, defaultCurrency, rates, displaySymbol } = currency;

  const dynamicsQuery = useCapitalDynamics();
  const accountsQuery = useAccounts(userId);

  const isLoading = dynamicsQuery.isLoading || accountsQuery.isLoading;
  const isError = dynamicsQuery.isError || accountsQuery.isError;

  // База кривой — сумма initial_balance ВСЕХ счетов (и открытых, и закрытых),
  // далее точки идут по периодам-отчётам (дельта всех операций периода).
  // Из-за закрытых счетов и операций вне отчётов последняя точка кривой
  // может расходиться с «Капиталом» (там только открытые счета) — принято осознанно.
  const rawBase = useMemo(
    () => (accountsQuery.data ?? []).reduce((sum, account) => sum + account.initial_balance, 0),
    [accountsQuery.data],
  );

  const rawChartData = useMemo(
    () =>
      isLoading
        ? []
        : buildCapitalChartData({
            months: dynamicsQuery.data ?? EMPTY_ARRAY,
            base: rawBase,
          }),
    [dynamicsQuery.data, rawBase, isLoading],
  );

  const convertedChartData = useMemo(() => {
    if (!displayCurrency || !rates || !defaultCurrency) return rawChartData;
    return rawChartData.map((point) => ({
      ...point,
      value: convertAmount(point.value, defaultCurrency, displayCurrency, rates),
    }));
  }, [rawChartData, displayCurrency, rates, defaultCurrency]);

  const base = useMemo(() => {
    if (!displayCurrency || !rates || !defaultCurrency) return rawBase;
    return convertAmount(rawBase, defaultCurrency, displayCurrency, rates);
  }, [rawBase, displayCurrency, rates, defaultCurrency]);

  const chartData = useMemo(
    () => aggregatePoints(convertedChartData, aggregation),
    [convertedChartData, aggregation],
  );

  const displayData: ChartPoint[] = useMemo(
    () => (mode === 'period' ? toPeriodDeltas(chartData, base) : chartData),
    [chartData, base, mode],
  );

  const stats = useMemo(
    () => buildGrowthStats(chartData, aggregation, base, mode),
    [chartData, aggregation, base, mode],
  );

  if (isError) {
    return (
      <div className={commonStyles.animateCard} style={{ animationDelay: '0.12s' }}>
        <VErrorCard
          title="Не удалось загрузить динамику капитала"
          error={dynamicsQuery.error ?? accountsQuery.error}
          onRetry={() => {
            void dynamicsQuery.refetch();
            void accountsQuery.refetch();
          }}
          isRetrying={dynamicsQuery.isFetching || accountsQuery.isFetching}
        />
      </div>
    );
  }

  return (
    <div className={commonStyles.animateCard} style={{ animationDelay: '0.12s' }}>
      <VGrowthDynamicsCard
        title={title}
        isLoading={isLoading}
        mode={mode}
        aggregation={aggregation}
        onModeChange={setMode}
        onAggregationChange={setAggregation}
        chartData={displayData}
        stats={stats}
        base={base}
        displaySymbol={displaySymbol}
      />
    </div>
  );
};
