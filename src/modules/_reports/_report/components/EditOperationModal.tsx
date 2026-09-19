import type { Operation } from '@/shared/api/types/domain';
import { OperationForm } from './modals/shared/OperationForm';

interface EditOperationModalProps {
  operation: Operation;
  month: string;
  onClose: () => void;
}

export const EditOperationModal = (props: EditOperationModalProps) => <OperationForm {...props} />;
