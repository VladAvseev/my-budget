import type { CategoryType } from '@/shared/supabase/types/domain';
import { useAuth } from '@/shared/supabase/authProvider';
import { VButton } from '@/shared/ui/VButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import commonStyles from '@/shared/styles/common.module.css';
import { getErrorMessage } from '@/shared/utils';
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
  const [nameError, setNameError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const handleClose = () => {
    setName('');
    setColor('');
    setNameError(undefined);
    setSubmitError(undefined);
    onClose();
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

    setNameError(undefined);
    createCategory.mutate(
      { type, name: trimmedName, color: color || null },
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
            setName(nextValue);
            setNameError(undefined);
          }}
        />
        <CategoryColorPalette
          value={color}
          disabled={createCategory.isPending}
          onChange={setColor}
        />
      </div>
    </VModal>
  );
};