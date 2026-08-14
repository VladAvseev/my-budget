import type { Operation, OperationType } from '@/shared/supabase/services/operations';
import type { Report } from '@/shared/supabase/services/reports';
import { isSavingsType } from '@/shared/supabase/services/operations';
import { EditDailyModal } from './modals/edit/EditDailyModal';
import { EditSavingsModal } from './modals/edit/EditSavingsModal';
import { EditStandardModal } from './modals/edit/EditStandardModal';

interface EditOperationModalProps {
  operation: Operation;
  report: Report;
  onClose: () => void;
}

export const EditOperationModal = ({ operation, report, onClose }: EditOperationModalProps) => {
  const type = operation.type as OperationType;
  if (type === 'daily') {
    return <EditDailyModal operation={operation} report={report} onClose={onClose} />;
  }
  if (isSavingsType(type)) {
    return <EditSavingsModal operation={operation} report={report} onClose={onClose} />;
  }
  return <EditStandardModal operation={operation} report={report} onClose={onClose} />;
};