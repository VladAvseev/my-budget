import type { Category } from '@/shared/supabase/types/domain';
import type { Operation, OperationType } from '@/shared/supabase/types/domain';
import { signedOperationAmount } from '@/shared/supabase/types/domain';
import { useSetAtom } from 'jotai';
import { operationModalAtom } from '../../atoms/report';
import { OperationCardBase } from './OperationCardBase';

interface StandardOperationCardProps {
  operation: Operation;
  category?: Category | null;
  pending?: boolean;
}

export const StandardOperationCard = ({ operation, category, pending = false }: StandardOperationCardProps) => {
  const setModal = useSetAtom(operationModalAtom);

  const amount = signedOperationAmount(operation.type as OperationType, Number(operation.amount) || 0);

  return (
    <OperationCardBase
      amount={amount}
      amountColor="var(--color-text-primary)"
      description={operation.description}
      category={category}
      pending={pending}
      onOpen={() => setModal({ type: operation.type as OperationType, operation })}
    />
  );
};