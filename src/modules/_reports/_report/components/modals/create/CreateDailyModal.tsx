import type { Report } from '@/shared/supabase/types/domain';
import modalStyles from '@/shared/styles/modal.module.css';
import { getErrorMessage } from '@/shared/utils';
import { VButton } from '@/shared/ui/VButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useState } from 'react';
import { useCreateDailyExpense } from '../../../api/useCreateDailyExpense';
import { getAmountError } from '../shared/amountValidation';

interface CreateDailyModalProps {
  report: Report;
  onClose: () => void;
}

export const CreateDailyModal = ({ report, onClose }: CreateDailyModalProps) => {
  const createDailyExpense = useCreateDailyExpense(report.id);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [amountError, setAmountError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const isPending = createDailyExpense.isPending;

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
        periodStart: report.period_start ?? '',
        periodEnd: report.period_end ?? '',
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
          onChange={setDescription}
        />
      </div>
    </VModal>
  );
};