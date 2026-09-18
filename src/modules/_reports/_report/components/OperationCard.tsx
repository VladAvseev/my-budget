import type { Account, Category } from '@/shared/api/types/domain';
import type { Operation } from '@/shared/api/types/domain';
import { StandardOperationCard } from './cards/StandardOperationCard';
import { TransferOperationCard } from './cards/TransferOperationCard';

interface OperationCardProps {
  operation: Operation;
  category?: Category | null;
  account?: Account | null;
  pending?: boolean;
}

export const OperationCard = ({
  operation,
  category,
  account,
  pending = false,
}: OperationCardProps) => {
  if (operation.type === 'transfer') {
    return <TransferOperationCard operation={operation} pending={pending} />;
  }
  return (
    <StandardOperationCard
      operation={operation}
      category={category}
      account={account}
      pending={pending}
    />
  );
};
