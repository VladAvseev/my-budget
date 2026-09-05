import { useState } from 'react';
import type { Report } from '@/shared/supabase/types/domain';
import type { OperationType } from '@/shared/supabase/types/domain';
import { VButtonGroup } from '@/shared/ui/VButtonGroup';
import commonStyles from '@/shared/styles/common.module.css';
import { OperationList } from './OperationList';
import { DailyOperationsTab } from './DailyOperationsTab';

interface OperationsTabsProps {
  report: Report;
}

export type OperationsTab = 'expense' | 'income' | 'savings' | 'daily';

export const OperationsTabs = ({ report }: OperationsTabsProps) => {
  const [activeTab, setActiveTab] = useState<OperationsTab>(report.has_daily_expenses ? 'daily' : 'expense');

  const tabs: { value: OperationsTab; label: string }[] = [{ value: 'expense', label: 'Расходы' }];
  if (report.has_daily_expenses) {
    tabs.unshift({ value: 'daily', label: 'Еж. расходы' });
  }
  tabs.push({ value: 'income', label: 'Доходы' });
  tabs.push({ value: 'savings', label: 'Накопления' });

  return (
    <div className={commonStyles.columnL}>
      <VButtonGroup options={tabs} value={activeTab} onChange={setActiveTab} fullWidth />

      {activeTab === 'daily' ? (
        <DailyOperationsTab report={report} />
      ) : (
        <OperationList reportId={report.id} type={activeTab as OperationType} />
      )}
    </div>
  );
};
