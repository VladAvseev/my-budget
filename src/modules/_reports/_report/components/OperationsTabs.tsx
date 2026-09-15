import { useState } from 'react';
import { VButtonGroup } from '@/shared/ui/VButtonGroup';
import commonStyles from '@/shared/styles/common.module.css';
import { OperationList } from './OperationList';

interface OperationsTabsProps {
  /** Id из пути: запросы вкладок стартуют, не дожидаясь загрузки отчёта. */
  reportId: string;
}

export type OperationsTab = 'expense' | 'income' | 'transfer';

export const OperationsTabs = ({ reportId }: OperationsTabsProps) => {
  // Дефолтный таб всегда «Расходы»: он не зависит от полей отчёта, поэтому
  // не нужно ждать его загрузки и переключать таб по факту прихода данных.
  const [activeTab, setActiveTab] = useState<OperationsTab>('expense');

  const tabs: { value: OperationsTab; label: string }[] = [
    { value: 'expense', label: 'Расходы' },
    { value: 'income', label: 'Доходы' },
    { value: 'transfer', label: 'Переводы' },
  ];

  return (
    <div className={commonStyles.columnL}>
      <VButtonGroup options={tabs} value={activeTab} onChange={setActiveTab} fullWidth />

      <OperationList reportId={reportId} type={activeTab} />
    </div>
  );
};
