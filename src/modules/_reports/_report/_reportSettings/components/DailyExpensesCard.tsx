import type { Report } from '@/shared/supabase/services/reports';
import { getErrorMessage } from '@/shared/utils';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VConfirmModal } from '@/shared/ui/VConfirmModal';
import { VDatePicker } from '@/shared/ui/VDatePicker';
import { VTextInput } from '@/shared/ui/VTextInput';
import { VToggle } from '@/shared/ui/VToggle';
import { useState } from 'react';
import { useDisableDailyExpenses } from '../api/useDisableDailyExpenses';
import { useUpdateReport } from '../api/useUpdateReport';
import styles from '../settingsCard.module.css';

interface DailyExpensesCardProps {
  report: Report;
}

export const DailyExpensesCard = ({ report }: DailyExpensesCardProps) => {
  const updateReport = useUpdateReport(report.id);
  const disableDailyExpenses = useDisableDailyExpenses(report.id);

  const [isPendingEnabled, setIsPendingEnabled] = useState(false);
  const isEnabled = report.has_daily_expenses || isPendingEnabled;

  const [dailyBudget, setDailyBudget] = useState(report.daily_budget ?? '');
  const [isBudgetEnabled, setIsBudgetEnabled] = useState(report.daily_budget != null);
  const [periodStart, setPeriodStart] = useState(report.period_start ?? '');
  const [periodEnd, setPeriodEnd] = useState(report.period_end ?? '');

  const [budgetError, setBudgetError] = useState<string>();
  const [startError, setStartError] = useState<string>();
  const [endError, setEndError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [isSaved, setIsSaved] = useState(false);
  const [isDisableConfirmOpen, setIsDisableConfirmOpen] = useState(false);

  const handleSave = () => {
    setSubmitError(undefined);
    setIsSaved(false);
    let isValid = true;

    const budgetValue = Number(dailyBudget);
    if (isBudgetEnabled && (!dailyBudget || Number.isNaN(budgetValue) || budgetValue <= 0)) {
      setBudgetError('Укажите положительный ежедневный бюджет');
      isValid = false;
    } else {
      setBudgetError(undefined);
    }

    if (!periodStart) {
      setStartError('Укажите начало отчётного периода');
      isValid = false;
    } else {
      setStartError(undefined);
    }

    if (!periodEnd) {
      setEndError('Укажите конец отчётного периода');
      isValid = false;
    } else if (periodStart && periodEnd && periodStart > periodEnd) {
      setEndError('Конец периода не может быть раньше начала');
      isValid = false;
    } else {
      setEndError(undefined);
    }

    if (!isValid) {
      return;
    }

    updateReport.mutate(
      {
        hasDailyExpenses: true,
        dailyBudget: isBudgetEnabled ? budgetValue : null,
        periodStart,
        periodEnd,
      },
      {
        onSuccess: () => setIsSaved(true),
        onError: (error: Error) => setSubmitError(getErrorMessage(error)),
      },
    );
  };

  const handleToggleChange = (nextEnabled: boolean) => {
    setIsSaved(false);
    if (report.has_daily_expenses) {
      if (!nextEnabled) {
        setIsDisableConfirmOpen(true);
      }
      return;
    }
    setIsPendingEnabled(nextEnabled);
  };

  const handleConfirmDisable = () => {
    setSubmitError(undefined);
    disableDailyExpenses.mutate(undefined, {
      onSuccess: () => {
        setIsDisableConfirmOpen(false);
        setIsPendingEnabled(false);
        setDailyBudget('');
        setIsBudgetEnabled(false);
        setPeriodStart('');
        setPeriodEnd('');
        setBudgetError(undefined);
        setStartError(undefined);
        setEndError(undefined);
      },
      onError: (error: Error) => setSubmitError(getErrorMessage(error)),
    });
  };

  return (
    <VCard>
      <div className={styles.content}>
        <div className={styles.titleGrow}>
          Ежедневные расходы
          <VToggle
            checked={isEnabled}
            disabled={updateReport.isPending}
            onChange={handleToggleChange}
          />
        </div>

        {isSaved && !submitError && (
          <VBanner type="success" visible message="Настройки сохранены" />
        )}
        {submitError && <VBanner type="error" visible message={submitError} />}

        <div className={styles.content}>
          <div className={styles.row}>
            <div className={styles.label}>Ежедневный бюджет</div>
            <VToggle
              checked={isBudgetEnabled}
              disabled={!isEnabled || updateReport.isPending}
              onChange={(value) => {
                setIsBudgetEnabled(value);
                setBudgetError(undefined);
                setIsSaved(false);
              }}
            />
          </div>
          <VTextInput
            label="Ежедневный бюджет"
            numeric
            placeholder="0.00"
            value={dailyBudget}
            error={budgetError}
            disabled={!isEnabled || !isBudgetEnabled || updateReport.isPending}
            onChange={(value) => {
              setDailyBudget(value);
              setBudgetError(undefined);
              setIsSaved(false);
            }}
          />
          <VDatePicker
            label="Начало отчётного периода"
            value={periodStart}
            error={startError}
            disabled={!isEnabled || updateReport.isPending}
            onChange={(value) => {
              setPeriodStart(value);
              setStartError(undefined);
              setIsSaved(false);
            }}
          />
          <VDatePicker
            label="Конец отчётного периода"
            value={periodEnd}
            error={endError}
            disabled={!isEnabled || updateReport.isPending}
            onChange={(value) => {
              setPeriodEnd(value);
              setEndError(undefined);
              setIsSaved(false);
            }}
          />
          <div className={styles.rowEnd}>
            <VButton
              onClick={handleSave}
              isLoading={updateReport.isPending}
              isDisabled={!isEnabled}
            >
              Сохранить
            </VButton>
          </div>
        </div>
      </div>

      <VConfirmModal
        visible={isDisableConfirmOpen}
        title="Отключить ежедневные расходы"
        message="Все существующие операции с ежедневными расходами будут безвозвратно удалены. Продолжить?"
        confirmLabel="Отключить"
        isLoading={disableDailyExpenses.isPending}
        onCancel={() => setIsDisableConfirmOpen(false)}
        onConfirm={handleConfirmDisable}
      />
    </VCard>
  );
};