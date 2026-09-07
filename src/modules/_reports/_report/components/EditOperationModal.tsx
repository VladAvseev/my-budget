import type { Operation, OperationType } from '@/shared/supabase/types/domain';
import type { Report } from '@/shared/supabase/types/domain';
import { isSavingsType } from '@/shared/supabase/types/domain';
import { EditDailyModal } from './modals/edit/EditDailyModal';
import { EditSavingsModal } from './modals/edit/EditSavingsModal';
import { EditStandardModal } from './modals/edit/EditStandardModal';

interface EditOperationModalProps {
  operation: Operation;
  report: Report;
  onClose: () => void;
  isDeletable?: boolean;
}

export const EditOperationModal = ({ operation, report, onClose, isDeletable }: EditOperationModalProps) => {
  const type = operation.type as OperationType;
  if (type === 'daily') {
    return <EditDailyModal operation={operation} report={report} onClose={onClose} isDeletable={isDeletable} />;
  }
  if (isSavingsType(type)) {
    return <EditSavingsModal operation={operation} report={report} onClose={onClose} />;
  }
  return <EditStandardModal operation={operation} report={report} onClose={onClose} />;
};