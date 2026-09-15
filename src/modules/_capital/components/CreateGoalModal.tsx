import { useMemo, useState } from 'react';
import { useAuth } from '@/shared/api/authProvider';
import { useGoals } from '@/shared/api/hooks';
import modalStyles from './GoalModal.module.css';
import commonStyles from '@/shared/styles/common.module.css';
import { getErrorMessage, toISODate } from '@/shared/utils';
import { VButton } from '@/shared/ui/VButton';
import { VDatePicker } from '@/shared/ui/VDatePicker';
import { VModal } from '@/shared/ui/VModal';
import { VSelect } from '@/shared/ui/VSelect';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useCreateGoal } from '../api/useCreateGoal';
import { useAccounts } from '@/shared/api/hooks';

interface CreateGoalModalProps {
  onClose: () => void;
}

export const CreateGoalModal = ({ onClose }: CreateGoalModalProps) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const createGoal = useCreateGoal(userId);
  const accountsQuery = useAccounts(userId);
  const goalsQuery = useGoals(userId);

  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [accountIdError, setAccountIdError] = useState<string>();
  const [amountError, setAmountError] = useState<string>();
  const [targetDateError, setTargetDateError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const options = useMemo(() => {
    const existingAccountIds = new Set((goalsQuery.data ?? []).map((goal) => goal.account_id));
    return (accountsQuery.data ?? [])
      .filter((account) => !account.is_closed && !existingAccountIds.has(account.id))
      .map((account) => ({
        value: account.id,
        label: account.name,
      }));
  }, [accountsQuery.data, goalsQuery.data]);

  const handleClose = () => {
    if (createGoal.isPending) {
      return;
    }
    onClose();
  };

  const handleSubmit = () => {
    setSubmitError(undefined);
    const trimmedAmount = amount.trim();
    const amountValue = Number(trimmedAmount);

    if (!accountId) {
      setAccountIdError('Выберите счёт');
      return;
    }
    setAccountIdError(undefined);

    // Порог > 0, как на сервере (requireAmount strict + check amount > 0 в goals).
    if (trimmedAmount === '' || !Number.isFinite(amountValue) || amountValue <= 0) {
      setAmountError('Сумма должна быть больше нуля');
      return;
    }
    setAmountError(undefined);

    let targetDateValue: string | null = null;
    if (targetDate) {
      if (targetDate <= toISODate(new Date())) {
        setTargetDateError('Дата должна быть в будущем');
        return;
      }
      setTargetDateError(undefined);
      targetDateValue = targetDate;
    }

    createGoal.mutate(
      { accountId, amount: amountValue, targetDate: targetDateValue },
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
            Нет доступных счетов без цели. Добавьте или откройте счёт в профиле.
          </div>
        ) : (
          <>
            <VSelect
              label="Счёт"
              options={options}
              value={accountId}
              error={accountIdError}
              disabled={createGoal.isPending}
              onChange={(value) => {
                setAccountId(value);
                setAccountIdError(undefined);
              }}
            />
            <div className={modalStyles.amountField}>
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
            </div>
            <VDatePicker
              label="Желаемая дата достижения (необязательно)"
              value={targetDate}
              error={targetDateError}
              disabled={createGoal.isPending}
              onChange={(value) => {
                setTargetDate(value);
                setTargetDateError(undefined);
              }}
            />
          </>
        )}
      </div>
    </VModal>
  );
};
