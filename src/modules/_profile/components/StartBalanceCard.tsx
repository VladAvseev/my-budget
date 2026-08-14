import { HIDDEN_AMOUNT, useAmountsVisibility, useCapital, useProfile } from '@/shared/hooks';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { VTextInput } from '@/shared/ui/VTextInput';
import { VToggle } from '@/shared/ui/VToggle';
import commonStyles from '@/shared/styles/common.module.css';
import { formatAmount } from '@/shared/utils';
import { useState } from 'react';
import { useUpdateStartBalance } from '../api/useUpdateStartBalance';

export const StartBalanceCard = () => {
  const { data: profile, isLoading } = useProfile();
  const { balance, capital, isLoading: isAmountsLoading } = useCapital();
  const { showBalance, showCapital, setShowBalance, setShowCapital } = useAmountsVisibility();

  return (
    <VCard>
      <div className={commonStyles.columnL}>
        <div className={commonStyles.titleXl}>Баланс</div>

        <AmountRow
          label="Отображение Капитала"
          visible={showCapital}
          onToggle={setShowCapital}
          value={isAmountsLoading ? '—' : formatAmount(capital)}
        />
        <AmountRow
          label="Отображение Баланса"
          visible={showBalance}
          onToggle={setShowBalance}
          value={isAmountsLoading ? '—' : formatAmount(balance)}
        />

        {isLoading && (
          <div className={commonStyles.loaderContainer}>
            <VLoader size={28} />
          </div>
        )}

        {!isLoading && profile && (
          <StartBalanceForm userId={profile.user_id} initialBalance={profile.start_balance ?? ''} />
        )}
      </div>
    </VCard>
  );
};

interface AmountRowProps {
  label: string;
  value: string;
  visible: boolean;
  onToggle: (checked: boolean) => void;
}

const AmountRow = ({ label, value, visible, onToggle }: AmountRowProps) => {
  return (
    <div className={commonStyles.infoRow}>
      <span className={commonStyles.infoLabel}>{label}</span>
      <div className={`${commonStyles.row} ${commonStyles.gapM}`}>
        <span className={commonStyles.infoValueBold}>{visible ? value : HIDDEN_AMOUNT}</span>
        <VToggle checked={visible} onChange={onToggle} />
      </div>
    </div>
  );
};

interface StartBalanceFormProps {
  userId: string;
  initialBalance: string;
}

const StartBalanceForm = ({ userId, initialBalance }: StartBalanceFormProps) => {
  const updateStartBalance = useUpdateStartBalance(userId);

  const [value, setValue] = useState(initialBalance);
  const [balanceError, setBalanceError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = () => {
    const number = Number(value);
    if (!value.trim() || Number.isNaN(number) || number < 0) {
      setBalanceError('Введите неотрицательное число');
      setIsSaved(false);
      return;
    }
    setBalanceError(undefined);
    setSubmitError(undefined);
    setIsSaved(false);
    updateStartBalance.mutate(number, {
      onSuccess: () => setIsSaved(true),
      onError: (error: Error) => setSubmitError(error.message),
    });
  };

  return (
    <>
      {isSaved && !submitError && <VBanner type="success" visible message="Баланс сохранён" />}
      {submitError && <VBanner type="error" visible message={submitError} />}

      <div className={commonStyles.formRow}>
        <div className={commonStyles.flex1}>
          <VTextInput
            label="Начальный баланс"
            numeric
            placeholder="0.00"
            value={value}
            error={balanceError}
            disabled={updateStartBalance.isPending}
            onChange={(nextValue) => {
              setValue(nextValue);
              setBalanceError(undefined);
              setIsSaved(false);
            }}
          />
        </div>
        <VButton onClick={handleSubmit} isLoading={updateStartBalance.isPending}>
          Сохранить
        </VButton>
      </div>
    </>
  );
};