import type { Report } from '@/shared/supabase/services/reports';
import { useThemeStyles } from '@/shared/theme';
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
  const styles = useThemeStyles();
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
    const amountErrorValue = getAmountError(amount, 'create');
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
        onError: (error: Error) => setSubmitError(error.message),
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
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