import type { Category } from '@/shared/supabase/services/categories';
import type { Operation, OperationType } from '@/shared/supabase/services/operations';
import { isSavingsType } from '@/shared/supabase/services/operations';
import { SavingsOperationCard } from './cards/SavingsOperationCard';
import { StandardOperationCard } from './cards/StandardOperationCard';

interface OperationCardProps {
  operation: Operation;
  category?: Category | null;
  pending?: boolean;
}

export const OperationCard = ({ operation, category, pending = false }: OperationCardProps) => {
  if (isSavingsType(operation.type as OperationType)) {
    return (
      <SavingsOperationCard operation={operation} category={category} pending={pending} />
    );
  }
  return <StandardOperationCard operation={operation} category={category} pending={pending} />;
};