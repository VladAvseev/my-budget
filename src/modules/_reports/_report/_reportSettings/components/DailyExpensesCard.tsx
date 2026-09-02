import commonStyles from '@/shared/styles/common.module.css';
import type { Report } from '@/shared/supabase/types/domain';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VConfirmModal } from '@/shared/ui/VConfirmModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import { VToggle } from '@/shared/ui/VToggle';
import { getErrorMessage } from '@/shared/utils';
import { useMemo, useState } from 'react';
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

  const [budgetError, setBudgetError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [isSaved, setIsSaved] = useState(false);
  const [isDisableConfirmOpen, setIsDisableConfirmOpen] = useState(false);

  const isDirty = useMemo(() => {
    const hasBudgetChanged =
      isBudgetEnabled !== (report.daily_budget != null) ||
      (isBudgetEnabled && String(dailyBudget) !== String(report.daily_budget ?? ''));
    return isPendingEnabled !== false || hasBudgetChanged;
  }, [dailyBudget, isBudgetEnabled, isPendingEnabled, report]);

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

    if (!isValid) {
      return;
    }

    updateReport.mutate(
      {
        hasDailyExpenses: true,
        dailyBudget: isBudgetEnabled ? budgetValue : null,
        periodStart: report.period_start,
        periodEnd: report.period_end,
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
        setBudgetError(undefined);
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

        <div className={commonStyles.emptyHint}>
          Это отдельная категория расходов для учёта мелких ежедневных трат (кофе, проезд, перекусы
          и т.п.). Вместо того чтобы записывать каждую покупку отдельно, можно один раз в день
          вводить общую сумму таких расходов за день. Это упрощает учёт и позволяет видеть общую
          картину трат на мелочи.
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
          <div className={styles.rowEnd}>
            <VButton
              onClick={handleSave}
              isLoading={updateReport.isPending}
              isDisabled={!isEnabled || !isDirty}
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
