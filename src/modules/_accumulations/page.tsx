import { PlusIcon } from '@/shared/icons';
import { useAuth } from '@/shared/supabase/authProvider';
import { useAccumulations, useCurrency, useExchangeRates, useProfile } from '@/shared/hooks';
import { QUICK_CURRENCIES, getCurrencyByCode } from '@/shared/constants/currencies';
import { signedOperationAmount, type OperationType } from '@/shared/supabase/types/domain';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VHint } from '@/shared/ui/VHint';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VLoader } from '@/shared/ui/VLoader';
import commonStyles from '@/shared/styles/common.module.css';
import styles from './page.module.css';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  accumulationModalAtom,
  goalModalAtom,
  selectedDisplayCurrencyAtom,
} from './atoms/accumulations';
import { useCategories } from './api/useCategories';
import { useSavingsOperations } from './api/useSavingsOperations';
import { AccumulationsList } from './components/AccumulationsList';
import { AccumulationsStructure } from './components/AccumulationsStructure';
import { CreateAccumulationModal } from './components/CreateAccumulationModal';
import { GrowthChartsSection } from './components/GrowthChartsSection';
import { CreateGoalModal } from './components/CreateGoalModal';
import { EditAccumulationModal } from './components/EditAccumulationModal';
import { EditGoalModal } from './components/EditGoalModal';
import { GoalsSection } from './components/GoalsSection';
import { SavingsOperationsList } from './components/SavingsOperationsList';

const CURRENCY_OPTIONS: VButtonGroupOption[] = [
  { value: 'BYN', label: 'BYN' },
  { value: 'RUB', label: 'RUB' },
  { value: 'USD', label: 'USD' },
];

const isQuickCurrency = (code: string | null): code is string =>
  code !== null && (QUICK_CURRENCIES as readonly string[]).includes(code);

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const accumulationsQuery = useAccumulations(userId);
  const savingsQuery = useSavingsOperations(userId);
  const categoriesQuery = useCategories(userId);
  const [accumulationModal, setAccumulationModal] = useAtom(accumulationModalAtom);
  const [goalModal, setGoalModal] = useAtom(goalModalAtom);
  const [selectedCurrency, setSelectedCurrency] = useAtom(selectedDisplayCurrencyAtom);
  const currency = useCurrency();
  const { data: profile } = useProfile();
  const { data: rates } = useExchangeRates();

  const profileCurrency = profile?.currency ?? null;
  const defaultCurrency = isQuickCurrency(profileCurrency) ? profileCurrency : null;
  const isCurrencyDisabled = !isQuickCurrency(profileCurrency);

  useEffect(() => {
    if (defaultCurrency) {
      setSelectedCurrency(defaultCurrency);
    }
  }, [defaultCurrency, setSelectedCurrency]);

  const displayCurrency = selectedCurrency && rates ? selectedCurrency : null;
  const displaySymbol = displayCurrency
    ? getCurrencyByCode(displayCurrency)?.symbol
    : currency?.symbol;

  const conversionProps = {
    displayCurrency,
    rates,
    defaultCurrency,
    displaySymbol,
  };

  const accumulations = accumulationsQuery.data ?? [];
  const savings = savingsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const structureLoading =
    accumulationsQuery.isLoading || savingsQuery.isLoading || categoriesQuery.isLoading;

  const structureItems = [
    ...accumulations.map((accumulation) => ({
      categoryId: accumulation.category_id,
      amount: Number(accumulation.amount) || 0,
    })),
    ...savings.map((operation) => ({
      categoryId: operation.category_id,
      amount: signedOperationAmount(operation.type as OperationType, Number(operation.amount) || 0),
    })),
  ];

  return (
    <div className={commonStyles.page}>
      <VPageHeader
        title="Накопления"
        onBack={() => navigate('/')}
        backAriaLabel="Назад на главную"
        right={
          isCurrencyDisabled ? (
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
          )
        }
      />

      <GrowthChartsSection userId={userId} {...conversionProps} />

      {structureLoading ? (
        <div className={commonStyles.loaderContainer}>
          <VLoader />
        </div>
      ) : (
        <AccumulationsStructure
          items={structureItems}
          categories={categories}
          {...conversionProps}
        />
      )}
      <GoalsSection {...conversionProps} />

      <div className={commonStyles.row}>
        <div className={commonStyles.titleXl}>Накопления</div>
      </div>

      <SavingsOperationsList {...conversionProps} />

      <div className={styles.header}>
        <div className={commonStyles.titleXl}>Начальные накопления</div>
        <VIconButton
          ariaLabel="Добавить начальное накопление"
          onClick={() => setAccumulationModal({ accumulation: null })}
          isDisabled={accumulationsQuery.isLoading}
          color="var(--color-accent)"
        >
          <PlusIcon size={24} color="currentColor" />
        </VIconButton>
      </div>

      <AccumulationsList {...conversionProps} />

      {accumulationModal?.accumulation ? (
        <EditAccumulationModal
          key={accumulationModal.accumulation.id}
          accumulation={accumulationModal.accumulation}
          onClose={() => setAccumulationModal(null)}
        />
      ) : (
        accumulationModal && <CreateAccumulationModal onClose={() => setAccumulationModal(null)} />
      )}

      {goalModal?.goal ? (
        <EditGoalModal
          key={goalModal.goal.id}
          goal={goalModal.goal}
          onClose={() => setGoalModal(null)}
        />
      ) : (
        goalModal && <CreateGoalModal onClose={() => setGoalModal(null)} />
      )}
    </div>
  );
};
