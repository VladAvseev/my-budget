import type { Account, Category } from '@/shared/api/types/domain';
import type { ApiOperationType, Operation } from '@/shared/api/types/domain';
import { useSetAtom } from 'jotai';
import { operationModalAtom } from '../../atoms/report';
import { OperationCardBase } from './OperationCardBase';

interface StandardOperationCardProps {
  operation: Operation;
  category?: Category | null;
  account?: Account | null;
  pending?: boolean;
}

export const StandardOperationCard = ({
  operation,
  category,
  account,
  pending = false,
}: StandardOperationCardProps) => {
  const setModal = useSetAtom(operationModalAtom);

  const amount = Number(operation.amount) || 0;

  return (
    <OperationCardBase
      amount={amount}
      amountColor="var(--md-sys-color-on-surface)"
      description={operation.description}
      category={category}
      date={operation.date}
      accountName={account?.name}
      pending={pending}
      onOpen={() => setModal({ type: operation.type as ApiOperationType, operation })}
    />
  );
};
