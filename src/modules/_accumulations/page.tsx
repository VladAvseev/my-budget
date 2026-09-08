import { PlusIcon } from '@/shared/icons';
import { useAuth } from '@/shared/supabase/authProvider';
import { useAccumulations, useBreakpoint } from '@/shared/hooks';
import { signedOperationAmount, type OperationType } from '@/shared/supabase/types/domain';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VButtonGroup, type VButtonGroupOption } from '@/shared/ui/VButtonGroup';
import { VCurrencyRates } from '@/shared/ui/VCurrencyRates';
import { VHint } from '@/shared/ui/VHint';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VLoader } from '@/shared/ui/VLoader';
import commonStyles from '@/shared/styles/common.module.css';
import styles from './page.module.css';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  accumulationModalAtom,
  goalModalAtom,
  selectedDisplayCurrencyAtom,
} from './atoms/accumulations';
import { useDisplayCurrency } from './hooks/useDisplayCurrency';
import { useCategories } from './api/useCategories';
import { useSavingsOperations } from './api/useSavingsOperations';
import { AccumulationsList } from './components/AccumulationsList';
import { AccumulationsStructure } from './components/AccumulationsStructure';
import { CreateAccumulationModal } from './components/CreateAccumulationModal';
import { GrowthDynamicsCard } from './components/GrowthDynamicsCard';
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

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDesktop } = useBreakpoint();
  const userId = user?.id ?? '';
  const accumulationsQuery = useAccumulations(userId);
  const savingsQuery = useSavingsOperations(userId);
  const categoriesQuery = useCategories(userId);
  const [accumulationModal, setAccumulationModal] = useAtom(accumulationModalAtom);
  const [goalModal, setGoalModal] = useAtom(goalModalAtom);
  const {
    selectedCurrency,
    defaultCurrency,
    isCurrencyDisabled,
    displayCurrency,
    rates,
    displaySymbol,
  } = useDisplayCurrency();
  const setSelectedCurrency = useSetAtom(selectedDisplayCurrencyAtom);

  useEffect(() => {
    if (defaultCurrency) {
      setSelectedCurrency(defaultCurrency);
    }
  }, [defaultCurrency, setSelectedCurrency]);

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
    <div className={commonStyles.page}>
      <div className={commonStyles.pageHeaderRow}>
        <VPageHeader
          title="Накопления"
          onBack={() => navigate('/')}
          backAriaLabel="Назад на главную"
          hideOnMobile
        />
        {isDesktop && (
          <div className={styles.headerActions}>
            <VCurrencyRates selectedCurrency={displayCurrency} rates={rates} orientation="row" />
            {currencySwitcher}
          </div>
        )}
      </div>

      {!isDesktop && (
        <div className={styles.currencyRow}>
          {displayCurrency ? (
            <VCurrencyRates selectedCurrency={displayCurrency} rates={rates} orientation="stack" />
          ) : (
            <div className={commonStyles.titleXl}>Накопления</div>
          )}
          {currencySwitcher}
        </div>
      )}

      <GrowthDynamicsCard
        userId={userId}
        chartType="accumulations"
        title="Рост накоплений"
        currency={{ displayCurrency, defaultCurrency, rates, displaySymbol }}
      />

      {structureLoading ? (
        <div className={commonStyles.loaderContainer}>
          <VLoader />
        </div>
      ) : (
        <AccumulationsStructure items={structureItems} categories={categories} />
      )}
      <GoalsSection />

      <div className={commonStyles.row}>
        <div className={commonStyles.titleXl}>История накоплений</div>
      </div>

      <SavingsOperationsList />

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

      <AccumulationsList />

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
