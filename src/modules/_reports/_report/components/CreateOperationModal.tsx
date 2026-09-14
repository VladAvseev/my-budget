import type { ApiOperationType, Report } from '@/shared/api/types/domain';
import { OperationForm } from './modals/shared/OperationForm';

interface CreateOperationModalProps {
  type: ApiOperationType;
  report: Report;
  onClose: () => void;
}

export const CreateOperationModal = ({ type, report, onClose }: CreateOperationModalProps) => (
  <OperationForm initialType={type} report={report} onClose={onClose} />
);
