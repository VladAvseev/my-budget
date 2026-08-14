import { TrashIcon } from '@/shared/icons';
import type { Operation } from '@/shared/supabase/services/operations';
import type { Report } from '@/shared/supabase/services/reports';
import modalStyles from '@/shared/styles/modal.module.css';
import { VButton } from '@/shared/ui/VButton';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useState } from 'react';
import { useRemoveOperation } from '../../../api/useRemoveOperation';
import { useUpdateOperation } from '../../../api/useUpdateOperation';
import { getAmountError } from '../shared/amountValidation';

interface EditDailyModalProps {
  operation: Operation;
  report: Report;
  onClose: () => void;
}

export const EditDailyModal = ({ operation, report, onClose }: EditDailyModalProps) => {
  const updateOperation = useUpdateOperation(report.id);
  const removeOperation = useRemoveOperation(report.id);

  const [amount, setAmount] = useState(operation.amount ?? '');
  const [description, setDescription] = useState(operation.description ?? '');
  const [amountError, setAmountError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const isPending = updateOperation.isPending || removeOperation.isPending;

  const handleClose = () => {
    if (isPending) {
      return;
    }
    onClose();
  };

  const handleDelete = () => {
    setSubmitError(undefined);
    removeOperation.mutate(operation.id, {
      onSuccess: onClose,
      onError: (error: Error) => setSubmitError(error.message),
    });
  };

  const handleSubmit = () => {
    setSubmitError(undefined);
    const amountErrorValue = getAmountError(amount, 'edit');
    if (amountErrorValue) {
      setAmountError(amountErrorValue);
      return;
    }
    setAmountError(undefined);

    updateOperation.mutate(
      {
        id: operation.id,
        input: {
          amount: Number(amount),
          description: description || null,
        },
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
      title="Изменить операцию"
      onClose={handleClose}
      error={submitError}
      footer={
        <div className={modalStyles.footerSplit}>
          <VIconButton
            ariaLabel="Удалить операцию"
            onClick={handleDelete}
            isLoading={removeOperation.isPending}
            isDisabled={isPending}
            color="var(--color-error)"
          >
            <TrashIcon size={24} color="currentColor" />
          </VIconButton>
          <div className={modalStyles.footerRight}>
            <VButton variant="secondary" onClick={handleClose} isDisabled={isPending}>
              Отмена
            </VButton>
            <VButton
              onClick={handleSubmit}
              isLoading={updateOperation.isPending}
              isDisabled={isPending}
            >
              Сохранить
            </VButton>
          </div>
        </div>
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