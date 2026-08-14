import { useState } from 'react';
import type { Report } from '@/shared/supabase/services/reports';
import type { OperationType } from '@/shared/supabase/services/operations';
import { OperationList } from './OperationList';
import { DailyOperationsTab } from './DailyOperationsTab';
import tabsStyles from './tabs.module.css';

interface OperationsTabsProps {
  report: Report;
}

export type OperationsTab = 'expense' | 'income' | 'savings' | 'daily';

export const OperationsTabs = ({ report }: OperationsTabsProps) => {
  const [activeTab, setActiveTab] = useState<OperationsTab>(report.has_daily_expenses ? 'daily' : 'expense');
  const [hoveredTab, setHoveredTab] = useState<OperationsTab | null>(null);

  const tabs: { key: OperationsTab; label: string }[] = [{ key: 'expense', label: 'Расходы' }];
  if (report.has_daily_expenses) {
    tabs.unshift({ key: 'daily', label: 'Ежедневные расходы' });
  }
  tabs.push({ key: 'income', label: 'Доходы' });
  tabs.push({ key: 'savings', label: 'Накопления' });

  return (
    <div className={tabsStyles.tabsColumn}>
      <div className={tabsStyles.tabs}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isHovered = hoveredTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              onMouseEnter={() => setHoveredTab(tab.key)}
              onMouseLeave={() => setHoveredTab(null)}
              className={`${tabsStyles.tab}${isActive ? ` ${tabsStyles.tabActive}` : ''}${!isActive && isHovered ? ` ${tabsStyles.tabHover}` : ''}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'daily' ? (
        <DailyOperationsTab report={report} />
      ) : (
        <OperationList reportId={report.id} type={activeTab as OperationType} />
      )}
    </div>
  );
};