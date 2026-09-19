import type { ApiOperationType } from '@/shared/api/types/domain';
import { OperationForm } from './modals/shared/OperationForm';

interface CreateOperationModalProps {
  type: ApiOperationType;
  month: string;
  onClose: () => void;
}

export const CreateOperationModal = ({ type, month, onClose }: CreateOperationModalProps) => (
  <OperationForm initialType={type} month={month} onClose={onClose} />
);
