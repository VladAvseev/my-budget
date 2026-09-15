import { useMemo } from 'react';
import { useAccounts } from '@/shared/api/hooks';
import type { Account } from '@/shared/api/types/domain';
import { convertAmount, formatAmount } from '@/shared/utils';
import { DonutChart, type DonutSegment } from '@/shared/ui/DonutChart';
import { VCard } from '@/shared/ui/VCard';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VSkeleton } from '@/shared/ui/VSkeleton';
import commonStyles from '@/shared/styles/common.module.css';
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
          ? convertAmount(segment.total, convertOptions.from, convertOptions.to, convertOptions.rates)
          : undefined,
      })),
    [structure.segments, convertOptions],
  );

  const convertedTotal = useMemo(
    () => donutSegments.reduce((sum, segment) => sum + (segment.convertedTotal ?? segment.total), 0),
    [donutSegments],
  );

  if (accountsQuery.isLoading) {
    return (
      <div className={commonStyles.animateCard} style={{ animationDelay: '0.2s' }}>
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
      <div className={commonStyles.animateCard} style={{ animationDelay: '0.2s' }}>
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
    <div className={commonStyles.animateCard} style={{ animationDelay: '0.2s' }}>
      <VCard className={styles.content}>
        <div className={styles.title}>{title}</div>

        {segments.length === 0 || hasNegative || total <= 0 ? (
          <div className={styles.message}>
            {hasNegative ? 'Доли счетов невозможно отобразить' : 'Нет данных для отображения'}
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
    </div>
  );
};
