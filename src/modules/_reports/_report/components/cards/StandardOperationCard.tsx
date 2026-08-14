import type { Category } from '@/shared/supabase/services/categories';
import type { Operation, OperationType } from '@/shared/supabase/services/operations';
import { signedOperationAmount } from '@/shared/supabase/services/operations';
import { useThemeStyles } from '@/shared/theme';
import { useSetAtom } from 'jotai';
import { operationModalAtom } from '../../atoms/report';
import { OperationCardBase } from './OperationCardBase';

interface StandardOperationCardProps {
  operation: Operation;
  category?: Category | null;
  pending?: boolean;
}

export const StandardOperationCard = ({ operation, category, pending = false }: StandardOperationCardProps) => {
  const styles = useThemeStyles();
  const setModal = useSetAtom(operationModalAtom);

  const amount = signedOperationAmount(operation.type as OperationType, Number(operation.amount) || 0);

  return (
    <OperationCardBase
      amount={amount}
      amountColor={styles.colors.textPrimary}
      description={operation.description}
      category={category}
      pending={pending}
      onOpen={() => setModal({ type: operation.type as OperationType, operation })}
    />
  );
};