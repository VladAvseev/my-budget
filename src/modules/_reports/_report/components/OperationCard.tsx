import type { Category } from '@/shared/api/types/domain';
import type { Operation } from '@/shared/api/types/domain';
import { StandardOperationCard } from './cards/StandardOperationCard';
import { TransferOperationCard } from './cards/TransferOperationCard';

interface OperationCardProps {
  operation: Operation;
  category?: Category | null;
  pending?: boolean;
}

export const OperationCard = ({ operation, category, pending = false }: OperationCardProps) => {
  if (operation.type === 'transfer') {
    return <TransferOperationCard operation={operation} pending={pending} />;
  }
  return <StandardOperationCard operation={operation} category={category} pending={pending} />;
};
