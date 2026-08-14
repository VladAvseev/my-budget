import { useAccumulationsTotal, useAmountsVisibility } from '@/shared/hooks';
import { useAuth } from '@/shared/supabase/authProvider';
import { signedOperationAmount, type OperationType } from '@/shared/supabase/services/operations';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../api/useCategories';
import { useSavingsOperations } from '../api/useSavingsOperations';
import { AccumulationsStructure } from './AccumulationsStructure';
import styles from '../homeCard.module.css';

export const AccumulationsCard = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const accumulationsQuery = useAccumulationsTotal(userId);
  const savingsQuery = useSavingsOperations(userId);
  const categoriesQuery = useCategories(userId);
  const { showCapital } = useAmountsVisibility();

  const accumulations = accumulationsQuery.accumulations;
  const categories = categoriesQuery.data ?? [];

  const structureItems = useMemo(
    () => [
      ...accumulations.map((accumulation) => ({
        categoryId: accumulation.category_id,
        amount: Number(accumulation.amount) || 0,
      })),
      ...(savingsQuery.data ?? []).map((operation) => ({
        categoryId: operation.category_id,
        amount: signedOperationAmount(operation.type as OperationType, Number(operation.amount) || 0),
      })),
    ],
    [accumulations, savingsQuery.data],
  );

  const isLoading =
    accumulationsQuery.isLoading || savingsQuery.isLoading || categoriesQuery.isLoading;

  if (isLoading) {
    return (
      <VCard className={styles.loadingCard}>
        <VLoader size={28} />
      </VCard>
    );
  }

  if (structureItems.length === 0) {
    return null;
  }

  return (
    <Link to="/accumulations" className={styles.link}>
      <AccumulationsStructure
        items={structureItems}
        categories={categories}
        hideRing
        title="Накопления"
        maskAmounts={!showCapital}
        interactive
      />
    </Link>
  );
};