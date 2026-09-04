import { PlusIcon } from '@/shared/icons';
import { useAuth } from '@/shared/supabase/authProvider';
import { useAccumulations } from '@/shared/hooks';
import { signedOperationAmount, type OperationType } from '@/shared/supabase/types/domain';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VIconButton } from '@/shared/ui/VIconButton';
import commonStyles from '@/shared/styles/common.module.css';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { accumulationModalAtom, goalModalAtom } from './atoms/accumulations';
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

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const accumulationsQuery = useAccumulations(userId);
  const savingsQuery = useSavingsOperations(userId);
  const categoriesQuery = useCategories(userId);
  const [accumulationModal, setAccumulationModal] = useAtom(accumulationModalAtom);
  const [goalModal, setGoalModal] = useAtom(goalModalAtom);

  const accumulations = accumulationsQuery.data ?? [];
  const savings = savingsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

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
          <VIconButton
            ariaLabel="Добавить начальное накопление"
            onClick={() => setAccumulationModal({ accumulation: null })}
            isDisabled={accumulationsQuery.isLoading}
            color="var(--color-accent)"
          >
            <PlusIcon size={24} color="currentColor" />
          </VIconButton>
        }
      />


      <GrowthChartsSection userId={userId} />

      <AccumulationsStructure items={structureItems} categories={categories} />
      <GoalsSection />

      <div className={commonStyles.row}>
        <div className={commonStyles.titleXl}>Накопления из отчётов</div>
      </div>

      <SavingsOperationsList />
      
      <div className={commonStyles.row}>
        <div className={commonStyles.titleXl}>Начальные накопления</div>
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
