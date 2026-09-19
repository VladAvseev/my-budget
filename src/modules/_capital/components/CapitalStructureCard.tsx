import { Amount } from '@/shared/ui/Amount';
import { useMemo } from 'react';
import { useAccounts } from '@/shared/api/hooks';
import type { Account } from '@/shared/api/types/domain';
import { convertAmount } from '@/shared/utils';
import { DonutChart, type DonutSegment } from '@/shared/ui/DonutChart';
import { VCard } from '@/shared/ui/VCard';
import { VCategoryDot } from '@/shared/ui/VCategoryDot';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VSkeleton } from '@/shared/ui/VSkeleton';
import type { CapitalGrowthCardCurrency } from './CapitalGrowthCard';
import { buildCapitalStructureData } from '../utils/capitalStructure';
import styles from './CapitalStructureCard.module.css';

interface CapitalStructureCardProps {
  userId: string;
  title: string;
  currency: CapitalGrowthCardCurrency;
}

const EMPTY_ACCOUNTS: Account[] = [];

export const CapitalStructureCard = ({ userId, title, currency }: CapitalStructureCardProps) => {
  const { displayCurrency, defaultCurrency, rates, displaySymbol } = currency;

  const accountsQuery = useAccounts(userId);

  const structure = useMemo(
    () => buildCapitalStructureData(accountsQuery.data ?? EMPTY_ACCOUNTS),
    [accountsQuery.data],
  );

  const convertOptions = useMemo(() => {
    if (!displayCurrency || !rates || !defaultCurrency) return undefined;
    return { from: defaultCurrency, to: displayCurrency, rates };
  }, [displayCurrency, rates, defaultCurrency]);

  const donutSegments: DonutSegment[] = useMemo(
    () =>
      structure.segments.map((segment) => ({
        ...segment,
        convertedTotal: convertOptions
          ? convertAmount(
              segment.total,
              convertOptions.from,
              convertOptions.to,
              convertOptions.rates,
            )
          : undefined,
      })),
    [structure.segments, convertOptions],
  );

  const convertedTotal = useMemo(
    () =>
      donutSegments.reduce((sum, segment) => sum + (segment.convertedTotal ?? segment.total), 0),
    [donutSegments],
  );

  if (accountsQuery.isLoading) {
    return (
      <div className={styles.root}>
        <VCard className={styles.content} aria-busy="true">
          <VSkeleton width={220} height={24} />
          <div className={styles.skeletonChart}>
            <VSkeleton circle width={220} height={220} />
            <div className={styles.skeletonLegend}>
              {[0, 1, 2, 3].map((i) => (
                <VSkeleton key={i} height={18} />
              ))}
            </div>
          </div>
        </VCard>
      </div>
    );
  }

  if (accountsQuery.isError) {
    return (
      <div className={styles.root}>
        <VErrorCard
          title="Не удалось загрузить структуру капитала"
          error={accountsQuery.error}
          onRetry={() => {
            void accountsQuery.refetch();
          }}
          isRetrying={accountsQuery.isFetching}
        />
      </div>
    );
  }

  const { segments, total, hasNegative } = structure;

  return (
    <div className={styles.root}>
      <VCard className={styles.content}>
        <h2 className={styles.title}>{title}</h2>

        {segments.length === 0 || hasNegative || total <= 0 ? (
          <div className={styles.message}>
            {hasNegative ? 'Доли счетов невозможно отобразить' : 'Нет данных для отображения'}
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
                  <VCategoryDot color={segment.color} className={styles.dot} />
                  <span className={styles.accountName}>{segment.label}</span>
                  <span className={styles.percentage}>{segment.percent.toFixed(1)}%</span>
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
    </div>
  );
};
