import { useAtom } from 'jotai';
import React, { useMemo } from 'react';
import modalStyles from '@/shared/styles/modal.module.css';
import { getErrorMessage } from '@/shared/utils';
import {
  buildCode,
  buildName,
  buildPeriodDates,
  MONTHS_RU,
  MIN_YEAR,
  MAX_YEAR,
} from '@/shared/utils/monthMapping';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VModal } from '@/shared/ui/VModal';
import { VSelect, type VSelectOption } from '@/shared/ui/VSelect';
import { VTextInput } from '@/shared/ui/VTextInput';
import { VToggle } from '@/shared/ui/VToggle';
import { ChevronLeftIcon, ChevronRightIcon } from '@/shared/icons';
import { useCreateReport } from '../api/useCreateReport';
import { useReports } from '../api/useReports';
import {
  dailyBudgetAtom,
  hasDailyBudgetAtom,
  hasDailyExpensesAtom,
  selectedMonthAtom,
  selectedYearAtom,
} from '../atoms/reports';
import styles from './CreateReportModal.module.css';

interface CreateReportModalProps {
  visible: boolean;
  onClose: () => void;
}

const MONTH_OPTIONS: VSelectOption[] = MONTHS_RU.map((name, index) => ({
  value: String(index),
  label: name,
}));

const YEAR_OPTIONS: VSelectOption[] = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, i) => {
    const year = MIN_YEAR + i;
    return { value: String(year), label: String(year) };
  },
);

export const CreateReportModal = ({ visible, onClose }: CreateReportModalProps) => {
  const [selectedMonth, setSelectedMonth] = useAtom(selectedMonthAtom);
  const [selectedYear, setSelectedYear] = useAtom(selectedYearAtom);
  const [hasDailyExpenses, setHasDailyExpenses] = useAtom(hasDailyExpensesAtom);
  const [hasDailyBudget, setHasDailyBudget] = useAtom(hasDailyBudgetAtom);
  const [dailyBudget, setDailyBudget] = useAtom(dailyBudgetAtom);

  const [budgetError, setBudgetError] = React.useState<string>();
  const [submitError, setSubmitError] = React.useState<string>();

  const create = useCreateReport();
  const reportsQuery = useReports();

  const code = useMemo(() => buildCode(selectedMonth, selectedYear), [selectedMonth, selectedYear]);
  const name = useMemo(() => buildName(selectedMonth, selectedYear), [selectedMonth, selectedYear]);
  const { periodStart, periodEnd } = useMemo(
    () => buildPeriodDates(selectedMonth, selectedYear),
    [selectedMonth, selectedYear],
  );

  const codeExists = useMemo(
    () => (reportsQuery.data ?? []).some((report) => (report.code ?? '') === code),
    [reportsQuery.data, code],
  );

  const isPrevDisabled = create.isPending || (selectedMonth === 0 && selectedYear === MIN_YEAR);
  const isNextDisabled = create.isPending || (selectedMonth === 11 && selectedYear === MAX_YEAR);

  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleClose = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
    setHasDailyExpenses(false);
    setHasDailyBudget(false);
    setDailyBudget('');
    setBudgetError(undefined);
    setSubmitError(undefined);
    onClose();
  };

  const handleSubmit = () => {
    setSubmitError(undefined);
    let isValid = true;

    if (codeExists) {
      setSubmitError('Отчёт с таким кодом уже существует');
      return;
    }

    const budgetValue = Number(dailyBudget);
    if (hasDailyExpenses) {
      if (hasDailyBudget && (!dailyBudget || Number.isNaN(budgetValue) || budgetValue <= 0)) {
        setBudgetError('Укажите положительный ежедневный бюджет');
        isValid = false;
      } else {
        setBudgetError(undefined);
      }
    }

    if (!isValid) {
      return;
    }

    create.mutate(
      {
        name,
        code,
        hasDailyExpenses,
        dailyBudget: hasDailyExpenses && hasDailyBudget ? budgetValue : null,
        periodStart: hasDailyExpenses ? periodStart : null,
        periodEnd: hasDailyExpenses ? periodEnd : null,
      },
      {
        onSuccess: handleClose,
        onError: (error: Error) => setSubmitError(getErrorMessage(error)),
      },
    );
  };

  return (
    <VModal
      visible={visible}
      title={`Новый отчёт ${name}`}
      onClose={handleClose}
      error={submitError}
      footer={
        <>
          <VButton variant="secondary" onClick={handleClose}>
            Отмена
          </VButton>
          <VButton
            onClick={handleSubmit}
            isLoading={create.isPending}
            isDisabled={codeExists}
          >
            Сохранить
          </VButton>
        </>
      }
    >
      <div className={modalStyles.content}>
        <div className={styles.sectionTitle}>Отчётный период</div>
        <div className={styles.periodSelector}>
          <VIconButton
            ariaLabel="Предыдущий месяц"
            onClick={goToPrevMonth}
            isDisabled={isPrevDisabled}
            color="var(--color-text-primary)"
          >
            <ChevronLeftIcon size={20} color="currentColor" />
          </VIconButton>
          <div className={styles.selectsRow}>
            <div className={styles.selectGrow}>
              <VSelect
                options={MONTH_OPTIONS}
                value={String(selectedMonth)}
                disabled={create.isPending}
                required
                onChange={(value) => setSelectedMonth(Number(value))}
              />
            </div>
            <div className={styles.selectFixed}>
              <VSelect
                options={YEAR_OPTIONS}
                value={String(selectedYear)}
                disabled={create.isPending}
                required
                onChange={(value) => setSelectedYear(Number(value))}
              />
            </div>
          </div>
          <VIconButton
            ariaLabel="Следующий месяц"
            onClick={goToNextMonth}
            isDisabled={isNextDisabled}
            color="var(--color-text-primary)"
          >
            <ChevronRightIcon size={20} color="currentColor" />
          </VIconButton>
        </div>

        {codeExists && (
          <VBanner
            type="error"
            visible
            message="Отчёт с таким кодом уже существует"
          />
        )}

        <VToggle
          label="Ежедневные расходы"
          checked={hasDailyExpenses}
          disabled={create.isPending}
          onChange={setHasDailyExpenses}
        />

        {hasDailyExpenses && (
          <>
            <VToggle
              label="Ежедневный бюджет"
              checked={hasDailyBudget}
              disabled={create.isPending}
              onChange={(value) => {
                setHasDailyBudget(value);
                setBudgetError(undefined);
              }}
            />
            <VTextInput
              label="Ежедневный бюджет"
              numeric
              placeholder="0.00"
              value={dailyBudget}
              error={budgetError}
              disabled={!hasDailyBudget || create.isPending}
              onChange={(value) => {
                setDailyBudget(value);
                setBudgetError(undefined);
              }}
            />
          </>
        )}
      </div>
    </VModal>
  );
};
