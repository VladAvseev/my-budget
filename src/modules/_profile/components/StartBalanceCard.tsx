import { HIDDEN_AMOUNT, useAmountsVisibility, useCapital, useCurrency, useProfile } from '@/shared/hooks';
import { CURRENCIES } from '@/shared/constants/currencies';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { VSelect } from '@/shared/ui/VSelect';
import { VTextInput } from '@/shared/ui/VTextInput';
import { VToggle } from '@/shared/ui/VToggle';
import commonStyles from '@/shared/styles/common.module.css';
import { formatAmount, getErrorMessage } from '@/shared/utils';
import { useState } from 'react';
import { useUpdateCurrency } from '../api/useUpdateCurrency';
import { useUpdateStartBalance } from '../api/useUpdateStartBalance';

export const StartBalanceCard = () => {
  const { data: profile, isLoading } = useProfile();
  const { balance, capital, isLoading: isAmountsLoading } = useCapital();
  const { showBalance, showCapital, setShowBalance, setShowCapital } = useAmountsVisibility();
  const updateCurrency = useUpdateCurrency();
  const currency = useCurrency();

  const currencyOptions = CURRENCIES.map((c) => ({
    value: c.code,
    label: `${c.name} (${c.symbol})`,
  }));

  return (
    <VCard>
      <div className={commonStyles.columnL}>
        <div className={commonStyles.titleXl}>Баланс</div>

        <VSelect
          label="Валюта"
          options={currencyOptions}
          value={profile?.currency ?? ''}
          disabled={updateCurrency.isPending}
          onChange={(value) => updateCurrency.mutate(value || null)}
        />

        <AmountRow
          label="Отображение Капитала"
          visible={showCapital}
          onToggle={setShowCapital}
          value={isAmountsLoading ? '—' : formatAmount(capital, currency?.symbol)}
        />
        <AmountRow
          label="Отображение Баланса"
          visible={showBalance}
          onToggle={setShowBalance}
          value={isAmountsLoading ? '—' : formatAmount(balance, currency?.symbol)}
        />

        {isLoading && (
          <div className={commonStyles.loaderContainer}>
            <VLoader size={28} />
          </div>
        )}

        {!isLoading && profile && (
          <>
            <StartBalanceForm initialBalance={profile.start_balance ?? ''} />
            <div className={commonStyles.emptyHint}>
              Начальный баланс нужен для правильного расчёта текущего баланса и капитала
              с учётом всех операций в случае, если вы пользуетесь
              только одной картой и хотите, чтобы сумма в приложении совпадала
              с реальным балансом на карте. Укажите сумму, которой вы владели
              перед началом учёта в приложении.
            </div>
          </>
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
  initialBalance: string;
}

const StartBalanceForm = ({ initialBalance }: StartBalanceFormProps) => {
  const updateStartBalance = useUpdateStartBalance();

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
      onError: (error: Error) => setSubmitError(getErrorMessage(error)),
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