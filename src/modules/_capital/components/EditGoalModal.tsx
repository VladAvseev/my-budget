import { useState } from 'react';
import { TrashIcon } from '@/shared/icons';
import { useAuth } from '@/shared/api/authProvider';
import type { Goal } from '@/shared/api/types/domain';
import modalStyles from './GoalModal.module.css';
import { getErrorMessage, toISODate } from '@/shared/utils';
import { VButton } from '@/shared/ui/VButton';
import { VDatePicker } from '@/shared/ui/VDatePicker';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useAccounts } from '@/shared/api/hooks';
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
  const accountsQuery = useAccounts(userId);

  const account = accountsQuery.data?.find((item) => item.id === goal.account_id) ?? null;

  const [amount, setAmount] = useState(String(goal.amount ?? ''));
  const [amountError, setAmountError] = useState<string>();
  const [targetDate, setTargetDate] = useState(goal.target_date ?? '');
  const [targetDateError, setTargetDateError] = useState<string>();
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
    const trimmedAmount = amount.trim();
    const amountValue = Number(trimmedAmount);

    // Порог > 0, как на сервере (requireAmount strict + check amount > 0 в goals).
    if (trimmedAmount === '' || !Number.isFinite(amountValue) || amountValue <= 0) {
      setAmountError('Сумма должна быть больше нуля');
      return;
    }
    setAmountError(undefined);

    let targetDateValue: string | null = null;
    if (targetDate) {
      if (targetDate !== goal.target_date && targetDate <= toISODate(new Date())) {
        setTargetDateError('Дата должна быть в будущем');
        return;
      }
      setTargetDateError(undefined);
      targetDateValue = targetDate;
    }

    updateGoal.mutate(
      {
        id: goal.id,
        input: { amount: amountValue, targetDate: targetDateValue },
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
      className={modalStyles.dialog}
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
            color="var(--md-sys-color-error)"
          >
            <TrashIcon size={24} color="currentColor" />
          </VIconButton>
          <div className={modalStyles.footerRight}>
            <VButton variant="secondary" onClick={handleClose} isDisabled={isPending}>
              Отмена
            </VButton>
            <VButton onClick={handleSubmit} isLoading={updateGoal.isPending} isDisabled={isPending}>
              Сохранить
            </VButton>
          </div>
        </div>
      }
    >
      <div className={modalStyles.content}>
        <div className={styles.accountRow}>
          <span className={styles.accountLabel}>Счёт</span>
          <span className={styles.accountValue}>
            <span className={styles.accountDot} />
            {account?.name ?? 'Счёт недоступен'}
          </span>
        </div>
        <div className={modalStyles.amountField}>
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
        <VDatePicker
          label="Желаемая дата достижения (необязательно)"
          value={targetDate}
          error={targetDateError}
          disabled={isPending}
          onChange={(value) => {
            setTargetDate(value);
            setTargetDateError(undefined);
          }}
        />
      </div>
    </VModal>
  );
};
