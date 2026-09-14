import type { Category } from '@/shared/api/types/domain';
import type { Operation } from '@/shared/api/types/domain';
import { StandardOperationCard } from './cards/StandardOperationCard';

interface OperationCardProps {
  operation: Operation;
  category?: Category | null;
  pending?: boolean;
}

export const OperationCard = ({ operation, category, pending = false }: OperationCardProps) => {
  return <StandardOperationCard operation={operation} category={category} pending={pending} />;
};
