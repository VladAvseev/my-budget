import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VCurrencyRates } from '@/shared/ui/VCurrencyRates';
import { VHint } from '@/shared/ui/VHint';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { useAuth } from '@/shared/api/authProvider';
import { useBreakpoint } from '@/shared/hooks';
import commonStyles from '@/shared/styles/common.module.css';
import styles from './page.module.css';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectedDisplayCurrencyAtom } from './atoms/capital';
import { useDisplayCurrency } from './hooks/useDisplayCurrency';
import { GoalsSection } from './components/GoalsSection';
import { CapitalGrowthCard } from './components/CapitalGrowthCard';
import { CapitalStructureCard } from './components/CapitalStructureCard';

const CURRENCY_OPTIONS: VButtonGroupOption[] = [
  { value: 'BYN', label: 'BYN' },
  { value: 'RUB', label: 'RUB' },
  { value: 'USD', label: 'USD' },
];

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDesktop } = useBreakpoint();
  const userId = user?.id ?? '';
  const [selectedCurrency] = useAtom(selectedDisplayCurrencyAtom);
  const setSelectedCurrency = useSetAtom(selectedDisplayCurrencyAtom);
  const { defaultCurrency, isCurrencyDisabled, displayCurrency, rates, displaySymbol } =
    useDisplayCurrency();

  useEffect(() => {
    if (defaultCurrency) {
      setSelectedCurrency(defaultCurrency);
    }
  }, [defaultCurrency, setSelectedCurrency]);

  const currencySwitcher = isCurrencyDisabled ? (
    <VHint hint="Сначала выберите валюту в профиле" position="bottom-end">
      <VButtonGroup
        options={CURRENCY_OPTIONS}
        value={selectedCurrency}
        onChange={(value) => setSelectedCurrency(value as string)}
        disabled={isCurrencyDisabled}
      />
    </VHint>
  ) : (
    <VButtonGroup
      options={CURRENCY_OPTIONS}
      value={selectedCurrency}
      onChange={(value) => setSelectedCurrency(value as string)}
      disabled={isCurrencyDisabled}
    />
  );

  return (
    <div className={styles.page}>
      {isDesktop && (
        <div className={styles.header}>
          <VPageHeader
            title="Капитал"
            onBack={() => navigate('/')}
            backAriaLabel="Назад на главную"
          />
          <div className={styles.headerActions}>
            <VCurrencyRates selectedCurrency={displayCurrency} rates={rates} orientation="row" />
            {currencySwitcher}
          </div>
        </div>
      )}

      {!isDesktop && (
        <div className={styles.currencyRow}>
          {displayCurrency ? (
            <VCurrencyRates selectedCurrency={displayCurrency} rates={rates} orientation="stack" />
          ) : (
            <div className={commonStyles.titleXl}>Капитал</div>
          )}
          {currencySwitcher}
        </div>
      )}

      <div className={styles.analytics}>
        <CapitalGrowthCard
          userId={userId}
          title="Рост капитала"
          currency={{ displayCurrency, defaultCurrency, rates, displaySymbol }}
        />

        <CapitalStructureCard
          userId={userId}
          title="Структура капитала"
          currency={{ displayCurrency, defaultCurrency, rates, displaySymbol }}
        />
      </div>
      <GoalsSection />
    </div>
  );
};
