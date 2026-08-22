import { useState } from 'react';
import { TrashIcon } from '@/shared/icons';
import { useAuth } from '@/shared/supabase/authProvider';
import type { Goal } from '@/shared/supabase/types/domain';
import modalStyles from '@/shared/styles/modal.module.css';
import { getErrorMessage } from '@/shared/utils';
import { VButton } from '@/shared/ui/VButton';
import { VCategoryDot } from '@/shared/ui/VCategoryDot';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useCategories } from '../api/useCategories';
import { useRemoveGoal } from '../api/useRemoveGoal';
import { useUpdateGoal } from '../api/useUpdateGoal';
import styles from './EditGoalModal.module.css';

interface EditGoalModalProps {
  goal: Goal;
  onClose: () => void;
}

export const EditGoalModal = ({ goal, onClose }: EditGoalModalProps) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const updateGoal = useUpdateGoal(userId);
  const removeGoal = useRemoveGoal(userId);
  const categoriesQuery = useCategories(userId);

  const category =
    categoriesQuery.data?.find((item) => item.id === goal.category_id) ?? null;

  const [amount, setAmount] = useState(String(Number(goal.amount)));
  const [amountError, setAmountError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const isPending = updateGoal.isPending || removeGoal.isPending;

  const handleClose = () => {
    if (isPending) {
      return;
    }
    onClose();
  };

  const handleDelete = () => {
    setSubmitError(undefined);
    removeGoal.mutate(goal.id, {
      onSuccess: onClose,
      onError: (error: Error) => setSubmitError(getErrorMessage(error)),
    });
  };

  const handleSubmit = () => {
    setSubmitError(undefined);
    const amountValue = Number(amount);

    if (!amount || Number.isNaN(amountValue) || amountValue <= 0) {
      setAmountError('Укажите сумму больше нуля');
      return;
    }
    setAmountError(undefined);

    updateGoal.mutate(
      {
        id: goal.id,
        input: { amount: amountValue },
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
      title="Изменить цель"
      onClose={handleClose}
      error={submitError}
      footer={
        <div className={modalStyles.footerSplit}>
          <VIconButton
            ariaLabel="Удалить цель"
            onClick={handleDelete}
            isLoading={removeGoal.isPending}
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
              isLoading={updateGoal.isPending}
              isDisabled={isPending}
            >
              Сохранить
            </VButton>
          </div>
        </div>
      }
    >
      <div className={modalStyles.content}>
        <div className={styles.categoryRow}>
          <span className={styles.categoryLabel}>Категория</span>
          <span className={styles.categoryValue}>
            {category?.color ? (
              <VCategoryDot color={category.color} />
            ) : (
              <span className={styles.categoryDot} />
            )}
            {category?.name ?? 'Без категории'}
          </span>
        </div>
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
      </div>
    </VModal>
  );
};
