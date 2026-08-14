import type { CategoryType } from '@/shared/supabase/services/categories';
import { useAuth } from '@/shared/supabase/authProvider';
import { useThemeStyles } from '@/shared/theme';
import { VButton } from '@/shared/ui/VButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
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
  const styles = useThemeStyles();
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
        onError: (error: Error) => setSubmitError(error.message),
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
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