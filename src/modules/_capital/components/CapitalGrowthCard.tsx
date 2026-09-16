import { useMemo, useState } from 'react';
import { useAccounts, useCapitalDynamics, useProfile } from '@/shared/api/hooks';
import { convertAmount } from '@/shared/utils';
import { aggregatePoints, type GrowthAggregation } from '@/shared/utils/chartPoints';
import { buildCapitalChartData } from '@/shared/utils/buildCapitalChartData';
import { buildGrowthStats } from '@/shared/utils/buildGrowthStats';
import { VGrowthDynamicsCard } from '@/shared/ui/VGrowthDynamicsCard';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import styles from './CapitalGrowthCard.module.css';

export interface CapitalGrowthCardCurrency {
  displayCurrency: string | null;
  defaultCurrency: string | null;
  rates?: Record<string, number> | null;
  displaySymbol?: string;
}

interface CapitalGrowthCardProps {
  userId: string;
  title: string;
  currency: CapitalGrowthCardCurrency;
}

const EMPTY_ARRAY: never[] = [];

export const CapitalGrowthCard = ({ userId, title, currency }: CapitalGrowthCardProps) => {
  const [aggregation, setAggregation] = useState<GrowthAggregation>('M');

  const { displayCurrency, defaultCurrency, rates, displaySymbol } = currency;

  const dynamicsQuery = useCapitalDynamics();
  const accountsQuery = useAccounts(userId);
  const profileQuery = useProfile();

  const isLoading = dynamicsQuery.isLoading || accountsQuery.isLoading || profileQuery.isLoading;
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

  // Дата регистрации точнее месяца отсекает неполный первый период из среднего.
  // Профиль уже закэширован useDisplayCurrency, отдельного запроса обычно нет.
  const firstActivityDate = useMemo(() => {
    const raw = profileQuery.data?.created_at;
    if (!raw) return null;
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [profileQuery.data?.created_at]);

  const chartData = useMemo(
    () => aggregatePoints(convertedChartData, aggregation),
    [convertedChartData, aggregation],
  );

  const stats = useMemo(
    () => buildGrowthStats(chartData, aggregation, base, { firstActivityDate }),
    [chartData, aggregation, base, firstActivityDate],
  );

  if (isError) {
    return (
      <div className={styles.root} role="region" aria-label={title}>
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
    <div className={styles.root} role="region" aria-label={title}>
      <VGrowthDynamicsCard
        title={title}
        isLoading={isLoading}
        aggregation={aggregation}
        onAggregationChange={setAggregation}
        chartData={chartData}
        stats={stats}
        base={base}
        displaySymbol={displaySymbol}
      />
    </div>
  );
};
