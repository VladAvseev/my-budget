import type { CategoryType } from '@/shared/api/types/domain';
import { useAuth } from '@/shared/api/authProvider';
import { VButton } from '@/shared/ui/VButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import { VToggle } from '@/shared/ui/VToggle';
import commonStyles from '@/shared/styles/common.module.css';
import { capitalizeFirst, getErrorMessage } from '@/shared/utils';
import { useState } from 'react';
import { useCategories } from '../api/useCategories';
import { useCreateCategory } from '../api/useCreateCategory';
import { CategoryColorPalette } from './CategoryColorPalette';

interface AddCategoryModalProps {
  type: CategoryType;
  visible: boolean;
  onClose: () => void;
}

export const AddCategoryModal = ({ type, visible, onClose }: AddCategoryModalProps) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const createCategory = useCreateCategory(userId);
  const categoriesQuery = useCategories(userId, type);

  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [limit, setLimit] = useState('');
  const [showDailyLimit, setShowDailyLimit] = useState(false);
  const [nameError, setNameError] = useState<string>();
  const [limitError, setLimitError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const isExpense = type === 'expense';
  const limitLabel = isExpense ? 'Бюджет' : 'Цель';
  const dailyLabel = isExpense ? 'Показывать бюджет на день' : 'Показывать цель на день';

  const handleClose = () => {
    setName('');
    setColor('');
    setLimit('');
    setShowDailyLimit(false);
    setNameError(undefined);
    setLimitError(undefined);
    setSubmitError(undefined);
    onClose();
  };

  const parseLimit = (): number | null | undefined => {
    const trimmed = limit.trim();
    if (trimmed === '') return null;
    const value = Number(trimmed);
    if (!Number.isFinite(value) || value <= 0) {
      setLimitError('Укажите положительную сумму');
      return undefined;
    }
    setLimitError(undefined);
    return value;
  };

  const handleSubmit = () => {
    setSubmitError(undefined);
    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError('Укажите название категории');
      return;
    }

    if (
      (categoriesQuery.data ?? []).some(
        (category) => category.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      setNameError('Категория с таким названием уже существует');
      return;
    }

    const limitAmount = parseLimit();
    if (limitAmount === undefined) return;

    setNameError(undefined);
    createCategory.mutate(
      { type, name: trimmedName, color: color || null, limitAmount, showDailyLimit },
      {
        onSuccess: handleClose,
        onError: (error: Error) => setSubmitError(getErrorMessage(error)),
      },
    );
  };

  return (
    <VModal
      visible={visible}
      title="Новая категория"
      onClose={handleClose}
      error={submitError}
      footer={
        <>
          <VButton variant="secondary" onClick={handleClose} isDisabled={createCategory.isPending}>
            Отмена
          </VButton>
          <VButton onClick={handleSubmit} isLoading={createCategory.isPending}>
            Сохранить
          </VButton>
        </>
      }
    >
      <div className={commonStyles.columnL}>
        <VTextInput
          label="Название категории"
          placeholder="Например, Продукты"
          value={name}
          error={nameError}
          disabled={createCategory.isPending}
          onChange={(nextValue) => {
            setName(capitalizeFirst(nextValue));
            setNameError(undefined);
          }}
        />
        <CategoryColorPalette
          value={color}
          disabled={createCategory.isPending}
          onChange={setColor}
        />
        <VTextInput
          label={limitLabel}
          placeholder="0.00"
          numeric
          value={limit}
          error={limitError}
          disabled={createCategory.isPending}
          onChange={(nextValue) => {
            setLimit(nextValue);
            setLimitError(undefined);
          }}
        />
        <VToggle
          label={dailyLabel}
          checked={showDailyLimit}
          disabled={createCategory.isPending}
          onChange={setShowDailyLimit}
        />
      </div>
    </VModal>
  );
};
