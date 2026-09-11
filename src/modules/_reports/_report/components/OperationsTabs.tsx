import { useState } from 'react';
import type { Report } from '@/shared/api/types/domain';
import type { OperationType } from '@/shared/api/types/domain';
import { VButtonGroup } from '@/shared/ui/VButtonGroup';
import commonStyles from '@/shared/styles/common.module.css';
import { OperationList } from './OperationList';
import { DailyOperationsTab } from './DailyOperationsTab';

interface OperationsTabsProps {
  /** Id из пути: запросы вкладок стартуют, не дожидаясь загрузки отчёта. */
  reportId: string;
  /** Отчёт подгружается параллельно: без него вкладка «Еж. расходы» скрыта. */
  report?: Report;
}

export type OperationsTab = 'expense' | 'income' | 'savings' | 'daily';

export const OperationsTabs = ({ reportId, report }: OperationsTabsProps) => {
  // Дефолтный таб всегда «Расходы»: он не зависит от полей отчёта, поэтому
  // не нужно ждать его загрузки и переключать таб по факту прихода данных.
  const [activeTab, setActiveTab] = useState<OperationsTab>('expense');

  const tabs: { value: OperationsTab; label: string }[] = [];
  if (report?.has_daily_expenses) {
    tabs.push({ value: 'daily', label: 'Еж. расходы' });
  }
  tabs.push({ value: 'expense', label: 'Расходы' });
  tabs.push({ value: 'income', label: 'Доходы' });
  tabs.push({ value: 'savings', label: 'Накопления' });

  return (
    <div className={commonStyles.columnL}>
      <VButtonGroup options={tabs} value={activeTab} onChange={setActiveTab} fullWidth />

      {activeTab === 'daily' ? (
        report && <DailyOperationsTab report={report} />
      ) : (
        <OperationList reportId={reportId} type={activeTab as OperationType} />
      )}
    </div>
  );
};
