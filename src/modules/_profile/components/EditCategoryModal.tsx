import type { Category } from '@/shared/supabase/services/categories';
import { useAuth } from '@/shared/supabase/authProvider';
import { useThemeStyles } from '@/shared/theme';
import { VButton } from '@/shared/ui/VButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useState } from 'react';
import { useCategories } from '../api/useCategories';
import { useUpdateCategory } from '../api/useUpdateCategory';
import { CategoryColorPalette } from './CategoryColorPalette';

interface EditCategoryModalProps {
  category: Category | null;
  visible: boolean;
  onClose: () => void;
}

export const EditCategoryModal = ({ category, visible, onClose }: EditCategoryModalProps) => {
  const styles = useThemeStyles();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const updateCategory = useUpdateCategory(userId);
  const categoriesQuery = useCategories(userId, category?.type);

  const [name, setName] = useState(category?.name ?? '');
  const [color, setColor] = useState(category?.color ?? '');
  const [nameError, setNameError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const handleClose = () => {
    if (!updateCategory.isPending) {
      onClose();
    }
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
        (item) =>
          item.id !== category?.id &&
          item.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      setNameError('Категория с таким названием уже существует');
      return;
    }

    setNameError(undefined);
    updateCategory.mutate(
      { id: category?.id ?? '', input: { name: trimmedName, color: color || null } },
      {
        onSuccess: onClose,
        onError: (error: Error) => setSubmitError(error.message),
      },
    );
  };

  return (
    <VModal
      visible={visible}
      title="Изменить категорию"
      onClose={handleClose}
      error={submitError}
      footer={
        <>
          <VButton
            variant="secondary"
            onClick={handleClose}
            isDisabled={updateCategory.isPending}
          >
            Отмена
          </VButton>
          <VButton onClick={handleSubmit} isLoading={updateCategory.isPending}>
            Сохранить
          </VButton>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
        <VTextInput
          label="Название категории"
          value={name}
          error={nameError}
          disabled={updateCategory.isPending}
          onChange={(nextValue) => {
            setName(nextValue);
            setNameError(undefined);
          }}
        />
        <CategoryColorPalette
          value={color}
          disabled={updateCategory.isPending}
          onChange={setColor}
        />
      </div>
    </VModal>
  );
};