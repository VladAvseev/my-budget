import { PlusIcon } from '@/shared/icons';
import { useAuth } from '@/shared/supabase/authProvider';
import { useAccumulations } from '@/shared/hooks';
import { signedOperationAmount, type OperationType } from '@/shared/supabase/services/operations';
import { useThemeStyles } from '@/shared/theme';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VIconButton } from '@/shared/ui/VIconButton';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { accumulationModalAtom } from './atoms/accumulations';
import { useCategories } from './api/useCategories';
import { useSavingsOperations } from './api/useSavingsOperations';
import { AccumulationsList } from './components/AccumulationsList';
import { AccumulationsStructure } from './components/AccumulationsStructure';
import { CreateAccumulationModal } from './components/CreateAccumulationModal';
import { EditAccumulationModal } from './components/EditAccumulationModal';
import { SavingsOperationsList } from './components/SavingsOperationsList';

export const Page: React.FC = () => {
  const styles = useThemeStyles();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const accumulationsQuery = useAccumulations(userId);
  const savingsQuery = useSavingsOperations(userId);
  const categoriesQuery = useCategories(userId);
  const [accumulationModal, setAccumulationModal] = useAtom(accumulationModalAtom);

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: styles.spacing.l,
      }}
    >
      <VPageHeader
        title="Накопления"
        onBack={() => navigate('/')}
        backAriaLabel="Назад на главную"
        right={
          <VIconButton
            ariaLabel="Добавить накопление"
            onClick={() => setAccumulationModal({ accumulation: null })}
            isDisabled={accumulationsQuery.isLoading}
            color={styles.colors.accent}
          >
            <PlusIcon size={24} color={styles.colors.accent} />
          </VIconButton>
        }
      />

      <AccumulationsStructure items={structureItems} categories={categories} />

      <AccumulationsList />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: styles.spacing.m,
        }}
      >
        <div
          style={{
            fontSize: styles.typography.fontSize.xl,
            fontWeight: styles.typography.fontWeight.bold,
            color: styles.colors.textPrimary,
          }}
        >
          Накопления из отчётов
        </div>
      </div>

      <SavingsOperationsList />

      {accumulationModal?.accumulation ? (
        <EditAccumulationModal
          key={accumulationModal.accumulation.id}
          accumulation={accumulationModal.accumulation}
          onClose={() => setAccumulationModal(null)}
        />
      ) : (
        accumulationModal && <CreateAccumulationModal onClose={() => setAccumulationModal(null)} />
      )}
    </div>
  );
};
