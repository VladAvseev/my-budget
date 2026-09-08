import type { Report } from '@/shared/supabase/types/domain';
import modalStyles from '@/shared/styles/modal.module.css';
import { capitalizeFirst, formatDisplay, getErrorMessage, getNextFreeDate } from '@/shared/utils';
import { VButton } from '@/shared/ui/VButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useMemo, useState } from 'react';
import { useCreateDailyExpense } from '../../../api/useCreateDailyExpense';
import { useOperations } from '../../../api/useOperations';
import { getAmountError } from '../shared/amountValidation';

interface CreateDailyModalProps {
  report: Report;
  onClose: () => void;
}

export const CreateDailyModal = ({ report, onClose }: CreateDailyModalProps) => {
  const createDailyExpense = useCreateDailyExpense(report.id);
  const operationsQuery = useOperations(report.id, 'daily');

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [amountError, setAmountError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const isPending = createDailyExpense.isPending;

  const nextDate = useMemo(() => {
    const operations = operationsQuery.data ?? [];
    const usedDates = operations.map((op) => op.date ?? '');
    return getNextFreeDate(usedDates, report.period_start, report.period_end);
  }, [operationsQuery.data, report.period_start, report.period_end]);

  const handleClose = () => {
    if (isPending) {
      return;
    }
    onClose();
  };

  const handleSubmit = () => {
    setSubmitError(undefined);
    const amountErrorValue = getAmountError(amount);
    if (amountErrorValue) {
      setAmountError(amountErrorValue);
      return;
    }
    setAmountError(undefined);

    createDailyExpense.mutate(
      {
        input: { amount: Number(amount), description: description || null },
        periodStart: report.period_start,
        periodEnd: report.period_end,
      },
      {
        onSuccess: onClose,
        onError: (error: Error) => setSubmitError(getErrorMessage(error)),
      },
    );
  };

  return (
    <VModal
      visible
      title="Новая операция"
      onClose={handleClose}
      error={submitError}
      footer={
        <>
          <VButton variant="secondary" onClick={handleClose} isDisabled={isPending}>
            Отмена
          </VButton>
          <VButton onClick={handleSubmit} isLoading={isPending}>
            Сохранить
          </VButton>
        </>
      }
    >
      <div className={modalStyles.content}>
        {nextDate && <div className={modalStyles.dateLabel}>{formatDisplay(nextDate)}</div>}
        <VTextInput
          label="Сумма"
          numeric
          placeholder="0.00"
          value={amount}
          error={amountError}
          disabled={isPending}
          onChange={(value) => {
            setAmount(value);
            setAmountError(undefined);
          }}
        />
        <VTextInput
          label="Описание"
          placeholder="Описание операции"
          value={description}
          disabled={isPending}
          onChange={(value) => setDescription(capitalizeFirst(value))}
        />
      </div>
    </VModal>
  );
};
