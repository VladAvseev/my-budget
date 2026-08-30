import { TrashIcon } from '@/shared/icons';
import { useAuth } from '@/shared/supabase/authProvider';
import type { Operation } from '@/shared/supabase/types/domain';
import type { Report } from '@/shared/supabase/types/domain';
import modalStyles from '@/shared/styles/modal.module.css';
import { getErrorMessage } from '@/shared/utils';
import { VButton } from '@/shared/ui/VButton';
import { VDatePicker } from '@/shared/ui/VDatePicker';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useState } from 'react';
import { useRemoveOperation } from '../../../api/useRemoveOperation';
import { useUpdateOperation } from '../../../api/useUpdateOperation';
import { SavingsTypeTabs, savingsTypeOption, type SavingsType } from '../../SavingsTypeTabs';
import { CategorySelect } from '../shared/CategorySelect';
import { getAmountError } from '../shared/amountValidation';

interface EditSavingsModalProps {
  operation: Operation;
  report: Report;
  onClose: () => void;
}

export const EditSavingsModal = ({ operation, report, onClose }: EditSavingsModalProps) => {
  const { user } = useAuth();
  const updateOperation = useUpdateOperation(report.id);
  const removeOperation = useRemoveOperation(report.id);

  const initialType = operation.type as SavingsType;
  const [amount, setAmount] = useState(operation.amount ?? '');
  const [categoryId, setCategoryId] = useState(operation.category_id ?? '');
  const [description, setDescription] = useState(operation.description ?? '');
  const [date, setDate] = useState(operation.date ?? '');
  const [operationType, setOperationType] = useState<SavingsType>(initialType);
  const [amountError, setAmountError] = useState<string>();
  const [descriptionError, setDescriptionError] = useState<string>();
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

    if (!description.trim()) {
      setDescriptionError('Укажите описание операции');
      return;
    }
    setDescriptionError(undefined);

    const input: {
      amount?: number;
      type?: SavingsType;
      categoryId?: string | null;
      description?: string | null;
      date?: string | null;
    } = {
      amount: Number(amount),
      categoryId: categoryId || null,
      description: description || null,
      date: date || null,
    };
    if (operationType !== operation.type) {
      input.type = operationType;
    }

    updateOperation.mutate(
      { id: operation.id, input },
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
        <SavingsTypeTabs
          value={savingsTypeOption(operationType)}
          disabled={isPending}
          onChange={setOperationType}
        />
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
          error={descriptionError}
          disabled={isPending}
          onChange={(value) => {
            setDescription(value);
            setDescriptionError(undefined);
          }}
        />
        <CategorySelect
          userId={user?.id ?? ''}
          categoryType="savings"
          value={categoryId}
          disabled={isPending}
          onChange={setCategoryId}
        />
        <VDatePicker
          label="Дата"
          value={date}
          disabled={isPending}
          onChange={setDate}
        />
      </div>
    </VModal>
  );
};