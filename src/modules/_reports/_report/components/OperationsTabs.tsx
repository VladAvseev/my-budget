import { useState } from 'react';
import { VButtonGroup } from '@/shared/ui/VButtonGroup';
import commonStyles from '@/shared/styles/common.module.css';
import type { Report } from '@/shared/api/types/domain';
import { OperationList } from './OperationList';

interface OperationsTabsProps {

  reportId: string;
  report: Report | null;
}

export type OperationsTab = 'expense' | 'income' | 'transfer';

export const OperationsTabs = ({ reportId, report }: OperationsTabsProps) => {
  
  
  const [activeTab, setActiveTab] = useState<OperationsTab>('expense');

  const tabs: { value: OperationsTab; label: string }[] = [
    { value: 'expense', label: 'Расходы' },
    { value: 'income', label: 'Доходы' },
    { value: 'transfer', label: 'Переводы' },
  ];

  return (
    <div className={commonStyles.columnL}>
      <VButtonGroup options={tabs} value={activeTab} onChange={setActiveTab} fullWidth />

      <OperationList reportId={reportId} report={report} type={activeTab} />
    </div>
  );
};
