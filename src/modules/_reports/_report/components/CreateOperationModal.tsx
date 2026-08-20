import type { OperationType } from '@/shared/supabase/types/domain';
import type { Report } from '@/shared/supabase/types/domain';
import { isSavingsType } from '@/shared/supabase/types/domain';
import { CreateDailyModal } from './modals/create/CreateDailyModal';
import { CreateSavingsModal } from './modals/create/CreateSavingsModal';
import { CreateStandardModal } from './modals/create/CreateStandardModal';

interface CreateOperationModalProps {
  type: OperationType;
  report: Report;
  onClose: () => void;
}

export const CreateOperationModal = ({ type, report, onClose }: CreateOperationModalProps) => {
  if (type === 'daily') {
    return <CreateDailyModal report={report} onClose={onClose} />;
  }
  if (isSavingsType(type)) {
    return <CreateSavingsModal type={type as 'savings' | 'savings_out'} report={report} onClose={onClose} />;
  }
  return <CreateStandardModal type={type as 'income' | 'expense'} report={report} onClose={onClose} />;
};