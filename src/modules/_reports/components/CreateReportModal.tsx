import { useAtom } from 'jotai';
import { useState } from 'react';
import { useThemeStyles } from '@/shared/theme';
import { VButton } from '@/shared/ui/VButton';
import { VDatePicker } from '@/shared/ui/VDatePicker';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import { VToggle } from '@/shared/ui/VToggle';
import { useCreateReport } from '../api/useCreateReport';
import { useReports } from '../api/useReports';
import {
  dailyBudgetAtom,
  hasDailyBudgetAtom,
  hasDailyExpensesAtom,
  periodEndAtom,
  periodStartAtom,
  reportNameAtom,
} from '../atoms/reports';

interface CreateReportModalProps {
  visible: boolean;
  onClose: () => void;
}

const RU_MONTHS = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];

export const CreateReportModal = ({ visible, onClose }: CreateReportModalProps) => {
  const styles = useThemeStyles();
  const [name, setName] = useAtom(reportNameAtom);
  const [hasDailyExpenses, setHasDailyExpenses] = useAtom(hasDailyExpensesAtom);
  const [hasDailyBudget, setHasDailyBudget] = useAtom(hasDailyBudgetAtom);
  const [dailyBudget, setDailyBudget] = useAtom(dailyBudgetAtom);
  const [periodStart, setPeriodStart] = useAtom(periodStartAtom);
  const [periodEnd, setPeriodEnd] = useAtom(periodEndAtom);

  const [nameError, setNameError] = useState<string>();
  const [budgetError, setBudgetError] = useState<string>();
  const [startError, setStartError] = useState<string>();
  const [endError, setEndError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const create = useCreateReport();
  const reportsQuery = useReports();

  const currentDate = new Date();
  const currentMonth = RU_MONTHS[currentDate.getMonth()];
  const namePlaceholder = `Например, ${currentMonth[0].toUpperCase()}${currentMonth.slice(1)} ${currentDate.getFullYear()}`;

  const handleClose = () => {
    setName('');
    setHasDailyExpenses(false);
    setHasDailyBudget(false);
    setDailyBudget('');
    setPeriodStart('');
    setPeriodEnd('');
    setNameError(undefined);
    setBudgetError(undefined);
    setStartError(undefined);
    setEndError(undefined);
    setSubmitError(undefined);
    onClose();
  };

  const handleSubmit = () => {
    setSubmitError(undefined);
    let isValid = true;

    if (!name.trim()) {
      setNameError('Укажите название отчёта');
      isValid = false;
    } else if (
      (reportsQuery.data ?? []).some(
        (report) => report.name.trim().toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      setNameError('Отчёт с таким названием уже существует');
      isValid = false;
    } else {
      setNameError(undefined);
    }

    const budgetValue = Number(dailyBudget);
    if (hasDailyExpenses) {
      if (hasDailyBudget && (!dailyBudget || Number.isNaN(budgetValue) || budgetValue <= 0)) {
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
    }

    if (!isValid) {
      return;
    }

    create.mutate(
      {
        name: name.trim(),
        hasDailyExpenses,
        dailyBudget: hasDailyExpenses && hasDailyBudget ? budgetValue : null,
        periodStart: hasDailyExpenses ? periodStart : null,
        periodEnd: hasDailyExpenses ? periodEnd : null,
      },
      {
        onSuccess: handleClose,
        onError: (error: Error) => setSubmitError(error.message),
      },
    );
  };

  return (
    <VModal
      visible={visible}
      title="Новый отчёт"
      onClose={handleClose}
      error={submitError}
      footer={
        <>
          <VButton variant="secondary" onClick={handleClose}>
            Отмена
          </VButton>
          <VButton onClick={handleSubmit} isLoading={create.isPending}>
            Сохранить
          </VButton>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
        <VTextInput
          label="Название отчёта"
          placeholder={namePlaceholder}
          value={name}
          error={nameError}
          disabled={create.isPending}
          onChange={(value) => {
            setName(value);
            setNameError(undefined);
          }}
        />

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
            <VDatePicker
              label="Начало отчётного периода"
              value={periodStart}
              error={startError}
              disabled={create.isPending}
              onChange={(value) => {
                setPeriodStart(value);
                setStartError(undefined);
              }}
            />
            <VDatePicker
              label="Конец отчётного периода"
              value={periodEnd}
              error={endError}
              disabled={create.isPending}
              onChange={(value) => {
                setPeriodEnd(value);
                setEndError(undefined);
              }}
            />
          </>
        )}
      </div>
    </VModal>
  );
};