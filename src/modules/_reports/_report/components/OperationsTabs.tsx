import { useState } from 'react';
import type { Report } from '@/shared/supabase/services/reports';
import type { OperationType } from '@/shared/supabase/services/operations';
import { useThemeStyles } from '@/shared/theme';
import { OperationList } from './OperationList';
import { DailyOperationsTab } from './DailyOperationsTab';

interface OperationsTabsProps {
  report: Report;
}

export type OperationsTab = 'expense' | 'income' | 'savings' | 'daily';

export const OperationsTabs = ({ report }: OperationsTabsProps) => {
  const styles = useThemeStyles();
  const [activeTab, setActiveTab] = useState<OperationsTab>(report.has_daily_expenses ? 'daily' : 'expense');
  const [hoveredTab, setHoveredTab] = useState<OperationsTab | null>(null);

  const tabs: { key: OperationsTab; label: string }[] = [{ key: 'expense', label: 'Расходы' }];
  if (report.has_daily_expenses) {
    tabs.unshift({ key: 'daily', label: 'Ежедневные расходы' });
  }
  tabs.push({ key: 'income', label: 'Доходы' });
  tabs.push({ key: 'savings', label: 'Накопления' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: styles.spacing.s,
          flexWrap: 'wrap',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              onMouseEnter={() => setHoveredTab(tab.key)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                padding: `${styles.spacing.s} ${styles.spacing.l}`,
                borderRadius: styles.radius.m,
                border: isActive ? 'none' : `1px solid ${styles.colors.border}`,
                backgroundColor: isActive
                  ? styles.colors.accent
                  : hoveredTab === tab.key
                    ? styles.colors.bgSurfaceHover
                    : styles.colors.bgSurface,
                color: isActive ? styles.colors.bgPrimary : styles.colors.textSecondary,
                fontSize: styles.typography.fontSize.m,
                fontWeight: styles.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease, color 0.15s ease',
              }}
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