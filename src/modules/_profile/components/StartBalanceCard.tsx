import { useProfile } from '@/shared/api/hooks';
import { CURRENCIES, QUICK_CURRENCIES } from '@/shared/constants/currencies';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { VSelect } from '@/shared/ui/VSelect';
import { VTextInput } from '@/shared/ui/VTextInput';
import commonStyles from '@/shared/styles/common.module.css';
import { getErrorMessage } from '@/shared/utils';
import { useState } from 'react';
import { useUpdateCurrency } from '../api/useUpdateCurrency';
import { useUpdateStartBalance } from '../api/useUpdateStartBalance';

export const StartBalanceCard = () => {
  const { data: profile, isLoading } = useProfile();
  const updateCurrency = useUpdateCurrency();

  const currencyOptions = CURRENCIES.filter((c) =>
    (QUICK_CURRENCIES as readonly string[]).includes(c.code),
  ).map((c) => ({
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

        {isLoading && (
          <div className={commonStyles.loaderContainer}>
            <VLoader size={28} />
          </div>
        )}

        {!isLoading && profile && (
          <>
            <StartBalanceForm initialBalance={profile.start_balance ?? ''} />
            <div className={commonStyles.emptyHint}>
              Укажите сумму денежных средств, которой вы владели до начала учёта в приложении. Это
              позволит балансу в приложении совпадать с реальной суммой на ваших счетах.
            </div>
          </>
        )}
      </div>
    </VCard>
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
