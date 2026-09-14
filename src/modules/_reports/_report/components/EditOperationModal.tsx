import type { Operation, Report } from '@/shared/api/types/domain';
import { OperationForm } from './modals/shared/OperationForm';

interface EditOperationModalProps {
  operation: Operation;
  report: Report;
  onClose: () => void;
  isDeletable?: boolean;
}

export const EditOperationModal = (props: EditOperationModalProps) => <OperationForm {...props} />;
