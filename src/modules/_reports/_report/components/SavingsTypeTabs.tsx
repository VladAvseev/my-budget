import type { OperationType } from '@/shared/supabase/services/operations';
import tabsStyles from './tabs.module.css';

interface SavingsTypeTabsProps {
  value: 'savings' | 'savings_out';
  disabled?: boolean;
  onChange: (value: 'savings' | 'savings_out') => void;
}

const TABS: { key: 'savings' | 'savings_out'; label: string }[] = [
  { key: 'savings', label: 'Пополнение' },
  { key: 'savings_out', label: 'Вывод средств' },
];

export const SavingsTypeTabs = ({ value, disabled = false, onChange }: SavingsTypeTabsProps) => (
  <div className={tabsStyles.tabs}>
    {TABS.map((tab) => {
      const isActive = value === tab.key;
      return (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          disabled={disabled}
          className={`${tabsStyles.tab} ${tabsStyles.tabGrow}${isActive ? ` ${tabsStyles.tabGrowActive}` : ''}${disabled ? ` ${tabsStyles.tabDisabled}` : ''}`}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
);

export type SavingsType = 'savings' | 'savings_out';

export const savingsTypeOption = (type: OperationType): SavingsType =>
  type === 'savings_out' ? 'savings_out' : 'savings';