import { useMemo, useState } from 'react';
import { useAuth } from '@/shared/supabase/authProvider';
import { useGoals } from '@/shared/hooks';
import modalStyles from '@/shared/styles/modal.module.css';
import commonStyles from '@/shared/styles/common.module.css';
import { getErrorMessage } from '@/shared/utils';
import { VButton } from '@/shared/ui/VButton';
import { VCategoryDot } from '@/shared/ui/VCategoryDot';
import { VModal } from '@/shared/ui/VModal';
import { VSelect } from '@/shared/ui/VSelect';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useCreateGoal } from '../api/useCreateGoal';
import { useCategories } from '../api/useCategories';

interface CreateGoalModalProps {
  onClose: () => void;
}

export const CreateGoalModal = ({ onClose }: CreateGoalModalProps) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const createGoal = useCreateGoal(userId);
  const categoriesQuery = useCategories(userId);
  const goalsQuery = useGoals(userId);

  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryIdError, setCategoryIdError] = useState<string>();
  const [amountError, setAmountError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const options = useMemo(() => {
    const existingCategoryIds = new Set(
      (goalsQuery.data ?? []).map((goal) => goal.category_id),
    );
    return (categoriesQuery.data ?? [])
      .filter((category) => !existingCategoryIds.has(category.id))
      .map((category) => ({
        value: category.id,
        label: category.name,
        ...(category.color ? { prefix: <VCategoryDot color={category.color} /> } : {}),
      }));
  }, [categoriesQuery.data, goalsQuery.data]);

  const handleClose = () => {
    if (createGoal.isPending) {
      return;
    }
    onClose();
  };

  const handleSubmit = () => {
    setSubmitError(undefined);
    const amountValue = Number(amount);

    if (!categoryId) {
      setCategoryIdError('Выберите категорию накоплений');
      return;
    }
    setCategoryIdError(undefined);

    if (!amount || Number.isNaN(amountValue) || amountValue <= 0) {
      setAmountError('Укажите сумму больше нуля');
      return;
    }
    setAmountError(undefined);

    createGoal.mutate(
      { categoryId, amount: amountValue },
      {
        onSuccess: onClose,
        onError: (error: Error) => setSubmitError(getErrorMessage(error)),
      },
    );
  };

  return (
    <VModal
      visible
      title="Новая цель"
      onClose={handleClose}
      error={submitError}
      footer={
        <>
          <VButton variant="secondary" onClick={handleClose} isDisabled={createGoal.isPending}>
            Отмена
          </VButton>
          <VButton
            onClick={handleSubmit}
            isLoading={createGoal.isPending}
            isDisabled={createGoal.isPending || options.length === 0}
          >
            Сохранить
          </VButton>
        </>
      }
    >
      <div className={modalStyles.content}>
        {options.length === 0 ? (
          <div className={commonStyles.emptyHint}>
            У всех категорий накоплений уже есть цель. Чтобы задать новую цель,
            удалите существующую в карточке категории.
          </div>
        ) : (
          <>
            <VSelect
              label="Категория"
              options={options}
              value={categoryId}
              error={categoryIdError}
              disabled={createGoal.isPending}
              onChange={(value) => {
                setCategoryId(value);
                setCategoryIdError(undefined);
              }}
            />
            <VTextInput
              label="Сумма"
              numeric
              placeholder="0.00"
              value={amount}
              error={amountError}
              disabled={createGoal.isPending}
              onChange={(value) => {
                setAmount(value);
                setAmountError(undefined);
              }}
            />
          </>
        )}
      </div>
    </VModal>
  );
};
