import { useMemo, useState } from 'react';
import { TrashIcon } from '@/shared/icons';
import { useAuth } from '@/shared/supabase/authProvider';
import type { Accumulation } from '@/shared/supabase/services/accumulations';
import { useThemeStyles } from '@/shared/theme';
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
  const styles = useThemeStyles();
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
      onError: (error: Error) => setSubmitError(error.message),
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
        onError: (error: Error) => setSubmitError(error.message),
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: styles.spacing.m,
            width: '100%',
          }}
        >
          <VIconButton
            ariaLabel="Удалить накопление"
            onClick={handleDelete}
            isLoading={removeAccumulation.isPending}
            isDisabled={isPending}
            color={styles.colors.error}
          >
            <TrashIcon size={24} color={styles.colors.error} />
          </VIconButton>
          <div style={{ display: 'flex', gap: styles.spacing.m }}>
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
