import type { Category } from '@/shared/api/types/domain';
import { TrashIcon } from '@/shared/icons';
import { useAuth } from '@/shared/api/authProvider';
import { VButton } from '@/shared/ui/VButton';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import commonStyles from '@/shared/styles/common.module.css';
import modalStyles from '@/shared/styles/modal.module.css';
import { capitalizeFirst, getErrorMessage } from '@/shared/utils';
import { useState } from 'react';
import type { CategoryType } from '@/shared/api/types/domain';
import { useCategories } from '../api/useCategories';
import { useUpdateCategory } from '../api/useUpdateCategory';
import { CategoryColorPalette } from './CategoryColorPalette';

interface EditCategoryModalProps {
  category: Category | null;
  visible: boolean;
  onClose: () => void;
  onRequestDelete: (category: Category) => void;
}

export const EditCategoryModal = ({
  category,
  visible,
  onClose,
  onRequestDelete,
}: EditCategoryModalProps) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const updateCategory = useUpdateCategory(userId);
  const categoriesQuery = useCategories(userId, category?.type as CategoryType | undefined);

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
          item.id !== category?.id && item.name.trim().toLowerCase() === trimmedName.toLowerCase(),
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
        onError: (error: Error) => setSubmitError(getErrorMessage(error)),
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
        <div className={modalStyles.footerSplit}>
          <VIconButton
            ariaLabel="Удалить категорию"
            onClick={() => category && onRequestDelete(category)}
            isDisabled={updateCategory.isPending}
            color="var(--color-error)"
          >
            <TrashIcon size={24} color="currentColor" />
          </VIconButton>
          <div className={modalStyles.footerRight}>
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
          </div>
        </div>
      }
    >
      <div className={commonStyles.columnL}>
        <VTextInput
          label="Название категории"
          value={name}
          error={nameError}
          disabled={updateCategory.isPending}
          onChange={(nextValue) => {
            setName(capitalizeFirst(nextValue));
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
