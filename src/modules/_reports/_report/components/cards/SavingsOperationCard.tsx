import type { Category } from '@/shared/supabase/services/categories';
import type { Operation, OperationType } from '@/shared/supabase/services/operations';
import { signedOperationAmount } from '@/shared/supabase/services/operations';
import { useSetAtom } from 'jotai';
import { operationModalAtom } from '../../atoms/report';
import { OperationCardBase } from './OperationCardBase';

interface SavingsOperationCardProps {
  operation: Operation;
  category?: Category | null;
  pending?: boolean;
}

export const SavingsOperationCard = ({ operation, category, pending = false }: SavingsOperationCardProps) => {
  const setModal = useSetAtom(operationModalAtom);

  const isWithdrawal = operation.type === 'savings_out';
  const amount = signedOperationAmount(operation.type as OperationType, Number(operation.amount) || 0);

  return (
    <OperationCardBase
      amount={amount}
      amountColor={isWithdrawal ? 'var(--color-error)' : 'var(--color-text-primary)'}
      description={operation.description}
      category={category}
      pending={pending}
      onOpen={() => setModal({ type: operation.type as OperationType, operation })}
    />
  );
};