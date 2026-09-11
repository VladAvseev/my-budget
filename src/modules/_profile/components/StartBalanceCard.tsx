import { useProfile } from '@/shared/api/hooks';
import { CURRENCIES, QUICK_CURRENCIES } from '@/shared/constants/currencies';
import { VBanner } from '@/shared/ui/VBanner';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VSkeleton } from '@/shared/ui/VSkeleton';
import { VSelect } from '@/shared/ui/VSelect';
import { VTextInput } from '@/shared/ui/VTextInput';
import commonStyles from '@/shared/styles/common.module.css';
import { getErrorMessage } from '@/shared/utils';
import { useState } from 'react';
import { useUpdateCurrency } from '../api/useUpdateCurrency';
import { useUpdateStartBalance } from '../api/useUpdateStartBalance';

export const StartBalanceCard = () => {
  const { data: profile, isLoading, error, refetch, isFetching } = useProfile();
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
          <div className={commonStyles.formRow} aria-busy="true">
            <div className={commonStyles.flex1}>
              <VSkeleton width={120} height={14} />
              <VSkeleton
                height={38}
                radius="var(--radius-m)"
                style={{ marginTop: 'var(--space-xs)' }}
              />
            </div>
            <VSkeleton width={120} height={38} radius="var(--radius-m)" />
          </div>
        )}

        {error && profile == null && (
          <VErrorCard
            title="Не удалось загрузить профиль"
            error={error}
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
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
    const trimmedValue = value.trim();
    const number = Number(trimmedValue);
    // Порог >= 0, как на сервере (users/service.ts: start_balance не может быть < 0).
    if (trimmedValue === '' || !Number.isFinite(number) || number < 0) {
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
