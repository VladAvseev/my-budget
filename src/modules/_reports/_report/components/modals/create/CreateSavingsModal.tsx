import { useAuth } from '@/shared/supabase/authProvider';
import type { Report } from '@/shared/supabase/types/domain';
import modalStyles from '@/shared/styles/modal.module.css';
import { getErrorMessage } from '@/shared/utils';
import { VButton } from '@/shared/ui/VButton';
import { VDatePicker } from '@/shared/ui/VDatePicker';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useState } from 'react';
import { useCreateOperation } from '../../../api/useCreateOperation';
import { SavingsTypeTabs, savingsTypeOption } from '../../SavingsTypeTabs';
import { CategorySelect } from '../shared/CategorySelect';
import { getAmountError } from '../shared/amountValidation';

interface CreateSavingsModalProps {
  type: 'savings' | 'savings_out';
  report: Report;
  onClose: () => void;
}

export const CreateSavingsModal = ({ type, report, onClose }: CreateSavingsModalProps) => {
  const { user } = useAuth();
  const createOperation = useCreateOperation(report.id);

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [operationType, setOperationType] = useState<'savings' | 'savings_out'>(type);
  const [amountError, setAmountError] = useState<string>();
  const [descriptionError, setDescriptionError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const isPending = createOperation.isPending;

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

    if (!description.trim()) {
      setDescriptionError('Укажите описание операции');
      return;
    }
    setDescriptionError(undefined);

    createOperation.mutate(
      {
        type: operationType,
        amount: Number(amount),
        categoryId: categoryId || null,
        description: description || null,
        date: date || null,
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