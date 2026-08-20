import type { Category } from '@/shared/supabase/types/domain';
import type { Operation, OperationType } from '@/shared/supabase/types/domain';
import { isSavingsType } from '@/shared/supabase/types/domain';
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