import { TrashIcon } from '@/shared/icons';
import type { Operation } from '@/shared/api/types/domain';
import type { Report } from '@/shared/api/types/domain';
import modalStyles from '@/shared/styles/modal.module.css';
import { capitalizeFirst, formatDisplay, getErrorMessage } from '@/shared/utils';
import { VButton } from '@/shared/ui/VButton';
import { VHint } from '@/shared/ui/VHint';
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
  isDeletable?: boolean;
}

export const EditDailyModal = ({
  operation,
  report,
  onClose,
  isDeletable = true,
}: EditDailyModalProps) => {
  const updateOperation = useUpdateOperation(report.id);
  const removeOperation = useRemoveOperation(report.id);

  const [amount, setAmount] = useState(String(operation.amount ?? ''));
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
      onError: (error: Error) => setSubmitError(getErrorMessage(error)),
    });
  };

  const handleSubmit = () => {
    setSubmitError(undefined);
    const amountErrorValue = getAmountError(amount);
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
        onError: (error: Error) => setSubmitError(getErrorMessage(error)),
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
          {isDeletable ? (
            <VIconButton
              ariaLabel="Удалить операцию"
              onClick={handleDelete}
              isLoading={removeOperation.isPending}
              isDisabled={isPending}
              color="var(--color-error)"
            >
              <TrashIcon size={24} color="currentColor" />
            </VIconButton>
          ) : (
            <VHint
              hint="Сначала удалите последний созданный ежедневный расход"
              position="top-start"
            >
              <VIconButton
                ariaLabel="Удалить операцию"
                onClick={handleDelete}
                isLoading={removeOperation.isPending}
                isDisabled
                color="var(--color-error)"
              >
                <TrashIcon size={24} color="currentColor" />
              </VIconButton>
            </VHint>
          )}
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
        {operation.date && (
          <div className={modalStyles.dateLabel}>{formatDisplay(operation.date)}</div>
        )}
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
