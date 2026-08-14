import { PlusIcon } from '@/shared/icons';
import type { Report } from '@/shared/supabase/services/reports';
import { useThemeStyles } from '@/shared/theme';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount, parseISO } from '@/shared/utils';
import { useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { useOperations } from '../api/useOperations';
import { operationModalAtom } from '../atoms/report';
import { DailyOperationCard } from './cards/DailyOperationCard';

interface DailyOperationsTabProps {
  report: Report;
}

export const DailyOperationsTab = ({ report }: DailyOperationsTabProps) => {
  const styles = useThemeStyles();
  const dailyBudget = Number(report.daily_budget) || 0;
  const hasBudget = report.daily_budget != null;
  const operationsQuery = useOperations(report.id, 'daily');
  const setModal = useSetAtom(operationModalAtom);
  const operations = operationsQuery.data ?? [];

  const { dayCount, spentTotal, deviationsSum } = useMemo(() => {
    const start = parseISO(report.period_start || undefined);
    const end = parseISO(report.period_end || undefined);
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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
      {hasBudget && (
        <VCard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
            <div
              style={{
                fontSize: styles.typography.fontSize.l,
                fontWeight: styles.typography.fontWeight.bold,
                color: styles.colors.textPrimary,
              }}
            >
              Сводка
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: styles.spacing.m,
              }}
            >
              <SummaryValue
                label="Бюджет на период"
                value={budgetPeriod}
                color={styles.colors.textPrimary}
              />
              <SummaryValue label="Сумма расходов" value={spentTotal} color={styles.colors.error} />
              <SummaryValue
                label="Остаток за период"
                value={deviationsSum >= 0 ? deviationsSum : deviationsSum * -1}
                color={deviationsSum > 0 ? styles.colors.error : styles.colors.success}
              />
            </div>
          </div>
        </VCard>
      )}

      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <VIconButton
          ariaLabel="Новая операция"
          onClick={() => setModal({ type: 'daily', operation: null })}
          isDisabled={isAddBlocked}
          color={styles.colors.accent}
        >
          <PlusIcon size={24} color={styles.colors.accent} />
        </VIconButton>
      </div>

      {operationsQuery.error && (
        <VBanner type="error" visible message="Не удалось загрузить операции" />
      )}

      {operationsQuery.isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: styles.spacing.xl }}>
          <VLoader size={28} />
        </div>
      )}

      {!operationsQuery.isLoading && operations.length === 0 && (
        <VCard>
          <div style={{ color: styles.colors.textSecondary }}>Операции не найдены</div>
        </VCard>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.m }}>
        {operations.map((operation) => (
          <DailyOperationCard
            key={operation.id}
            operation={operation}
            dailyBudget={hasBudget ? dailyBudget : null}
            pending={Boolean((operation as { _optimistic?: boolean })._optimistic)}
          />
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
  const styles = useThemeStyles();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.xs }}>
      <div style={{ fontSize: styles.typography.fontSize.s, color: styles.colors.textSecondary }}>
        {label}
      </div>
      <div
        style={{
          fontSize: styles.typography.fontSize.l,
          fontWeight: styles.typography.fontWeight.bold,
          color,
        }}
      >
        {formatAmount(value)}
      </div>
    </div>
  );
};
