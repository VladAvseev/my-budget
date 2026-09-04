import { PlusIcon } from '@/shared/icons';
import type { Report } from '@/shared/supabase/types/domain';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount, parseISO } from '@/shared/utils';
import { useCurrency } from '@/shared/hooks';
import commonStyles from '@/shared/styles/common.module.css';
import { useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { useOperations } from '../api/useOperations';
import { operationModalAtom } from '../atoms/report';
import { DailyOperationCard } from './cards/DailyOperationCard';
import styles from './DailyOperationsTab.module.css';

interface DailyOperationsTabProps {
  report: Report;
}

export const DailyOperationsTab = ({ report }: DailyOperationsTabProps) => {
  const dailyBudget = Number(report.daily_budget) || 0;
  const hasBudget = report.daily_budget != null;
  const operationsQuery = useOperations(report.id, 'daily');
  const setModal = useSetAtom(operationModalAtom);
  const operations = operationsQuery.data ?? [];

  const { dayCount, spentTotal, deviationsSum } = useMemo(() => {
    const start = parseISO(report.period_start);
    const end = parseISO(report.period_end);
    const days =
      start && end && end.getTime() >= start.getTime()
        ? Math.floor((end.getTime() - start.getTime()) / 86400000) + 1
        : 0;

    const queryOperations = operationsQuery.data ?? [];
    const spentTotalValue = queryOperations.reduce(
      (sum, operation) => sum + (Number(operation.amount) || 0),
      0,
    );
    const deviationValue = queryOperations.reduce(
      (sum, operation) => sum + (Number(operation.amount) || 0) - dailyBudget,
      0,
    );
    return { dayCount: days, spentTotal: spentTotalValue, deviationsSum: deviationValue };
  }, [operationsQuery.data, report.period_start, report.period_end, dailyBudget]);

  const budgetPeriod = dailyBudget * dayCount;
  const isAddBlocked = dayCount > 0 && operations.length >= dayCount;

  return (
    <div className={styles.root}>
      {hasBudget && (
        <VCard>
          <div className={styles.summaryContent}>
            <div className={styles.summaryGrid}>
              <SummaryValue
                label="Бюджет на период"
                value={budgetPeriod}
                color="var(--color-text-primary)"
              />
              <SummaryValue label="Сумма расходов" value={spentTotal} color="var(--color-error)" />
              <SummaryValue
                label="Остаток за период"
                value={deviationsSum >= 0 ? deviationsSum : deviationsSum * -1}
                color={deviationsSum > 0 ? 'var(--color-error)' : 'var(--color-success)'}
              />
            </div>
          </div>
        </VCard>
      )}

      <div className={styles.addButtonWrap}>
        <VIconButton
          ariaLabel="Новая операция"
          onClick={() => setModal({ type: 'daily', operation: null })}
          isDisabled={isAddBlocked}
          color="var(--color-accent)"
        >
          <PlusIcon size={24} color="currentColor" />
        </VIconButton>
      </div>

      {operationsQuery.error && (
        <VBanner type="error" visible message="Не удалось загрузить операции" />
      )}

      {operationsQuery.isLoading && (
        <div className={styles.loaderWrap}>
          <VLoader size={28} />
        </div>
      )}

      {!operationsQuery.isLoading && operations.length === 0 && (
        <VCard>
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>
              Ежедневные расходы — это записи о сумме трат за день, которые вы не хотите выносить в отдельный расход или категорию расходов в рамках отчёта.
            </div>
            <div className={styles.emptyHint}>Нажмите «+», чтобы добавить первую операцию.</div>
          </div>
        </VCard>
      )}

      <div className={styles.list}>
        {operations.map((operation, index) => (
          <div
            key={operation.id}
            className={commonStyles.animateCard}
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <DailyOperationCard
              operation={operation}
              dailyBudget={hasBudget ? dailyBudget : null}
              pending={Boolean((operation as { _optimistic?: boolean })._optimistic)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

interface SummaryValueProps {
  label: string;
  value: number;
  color: string;
}

const SummaryValue = ({ label, value, color }: SummaryValueProps) => {
  const currency = useCurrency();
  return (
    <div className={styles.summaryItem}>
      <div className={styles.summaryItemLabel}>{label}</div>
      <div className={styles.summaryItemValue} style={{ color }}>
        {formatAmount(value, currency?.symbol)}
      </div>
    </div>
  );
};