import { useMemo, useState } from 'react';
import { TrashIcon } from '@/shared/icons';
import { useAuth } from '@/shared/supabase/authProvider';
import type { Accumulation } from '@/shared/supabase/types/domain';
import modalStyles from '@/shared/styles/modal.module.css';
import { getErrorMessage } from '@/shared/utils';
import { VButton } from '@/shared/ui/VButton';
import { VCategoryDot } from '@/shared/ui/VCategoryDot';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VModal } from '@/shared/ui/VModal';
import { VSelect } from '@/shared/ui/VSelect';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useRemoveAccumulation } from '../api/useRemoveAccumulation';
import { useUpdateAccumulation } from '../api/useUpdateAccumulation';
import { useCategories } from '../api/useCategories';

interface EditAccumulationModalProps {
  accumulation: Accumulation;
  onClose: () => void;
}

export const EditAccumulationModal = ({ accumulation, onClose }: EditAccumulationModalProps) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const updateAccumulation = useUpdateAccumulation(userId);
  const removeAccumulation = useRemoveAccumulation(userId);
  const categoriesQuery = useCategories(userId);

  const [amount, setAmount] = useState(accumulation.amount);
  const [categoryId, setCategoryId] = useState(accumulation.category_id ?? '');
  const [description, setDescription] = useState(accumulation.description);
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

  const isPending = updateAccumulation.isPending || removeAccumulation.isPending;

  const handleClose = () => {
    if (isPending) {
      return;
    }
    onClose();
  };

  const handleDelete = () => {
    setSubmitError(undefined);
    removeAccumulation.mutate(accumulation.id, {
      onSuccess: onClose,
      onError: (error: Error) => setSubmitError(getErrorMessage(error)),
    });
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

    updateAccumulation.mutate(
      {
        id: accumulation.id,
        input: {
          amount: amountValue,
          categoryId: categoryId || null,
          description: trimmedDescription,
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
      title="Изменить накопление"
      onClose={handleClose}
      error={submitError}
      footer={
        <div className={modalStyles.footerSplit}>
          <VIconButton
            ariaLabel="Удалить накопление"
            onClick={handleDelete}
            isLoading={removeAccumulation.isPending}
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
              isLoading={updateAccumulation.isPending}
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
          placeholder="Описание накопления"
          value={description}
          error={descriptionError}
          disabled={isPending}
          onChange={(value) => {
            setDescription(value);
            setDescriptionError(undefined);
          }}
        />
        <VSelect
          label="Категория"
          options={options}
          value={categoryId}
          disabled={isPending}
          onChange={setCategoryId}
        />
      </div>
    </VModal>
  );
};