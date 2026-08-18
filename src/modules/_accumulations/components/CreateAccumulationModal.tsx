import { useMemo, useState } from 'react';
import { useAuth } from '@/shared/supabase/authProvider';
import modalStyles from '@/shared/styles/modal.module.css';
import { getErrorMessage } from '@/shared/utils';
import { VButton } from '@/shared/ui/VButton';
import { VCategoryDot } from '@/shared/ui/VCategoryDot';
import { VModal } from '@/shared/ui/VModal';
import { VSelect } from '@/shared/ui/VSelect';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useCreateAccumulation } from '../api/useCreateAccumulation';
import { useCategories } from '../api/useCategories';

interface CreateAccumulationModalProps {
  onClose: () => void;
}

export const CreateAccumulationModal = ({ onClose }: CreateAccumulationModalProps) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const createAccumulation = useCreateAccumulation(userId);
  const categoriesQuery = useCategories(userId);

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [amountError, setAmountError] = useState<string>();
  const [descriptionError, setDescriptionError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const options = useMemo(() => {
    const queryCategories = categoriesQuery.data ?? [];
    return [
      { value: '', label: 'Без категории' },
      ...queryCategories.map((category) => ({
        value: category.id,
        label: category.name,
        ...(category.color ? { prefix: <VCategoryDot color={category.color} /> } : {}),
      })),
    ];
  }, [categoriesQuery.data]);

  const handleClose = () => {
    if (createAccumulation.isPending) {
      return;
    }
    onClose();
  };

  const handleSubmit = () => {
    setSubmitError(undefined);
    const trimmedDescription = description.trim();
    const amountValue = Number(amount);

    if (!amount || Number.isNaN(amountValue) || amountValue < 0) {
      setAmountError('Укажите неотрицательную сумму');
      return;
    }
    setAmountError(undefined);

    if (!trimmedDescription) {
      setDescriptionError('Укажите описание накопления');
      return;
    }
    setDescriptionError(undefined);

    createAccumulation.mutate(
      {
        amount: amountValue,
        categoryId: categoryId || null,
        description: trimmedDescription,
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
      title="Новое накопление"
      onClose={handleClose}
      error={submitError}
      footer={
        <>
          <VButton variant="secondary" onClick={handleClose} isDisabled={createAccumulation.isPending}>
            Отмена
          </VButton>
          <VButton onClick={handleSubmit} isLoading={createAccumulation.isPending}>
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
          disabled={createAccumulation.isPending}
          onChange={(value) => {
            setAmount(value);
            setAmountError(undefined);
          }}
        />
        <VTextInput
          label="Описание"
          placeholder="Описание накопления"
          value={description}
          error={descriptionError}
          disabled={createAccumulation.isPending}
          onChange={(value) => {
            setDescription(value);
            setDescriptionError(undefined);
          }}
        />
        <VSelect
          label="Категория"
          options={options}
          value={categoryId}
          disabled={createAccumulation.isPending}
          onChange={setCategoryId}
        />
      </div>
    </VModal>
  );
};