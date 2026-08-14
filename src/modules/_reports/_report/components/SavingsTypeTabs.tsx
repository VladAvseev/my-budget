import type { OperationType } from '@/shared/supabase/services/operations';
import { useThemeStyles } from '@/shared/theme';

interface SavingsTypeTabsProps {
  value: 'savings' | 'savings_out';
  disabled?: boolean;
  onChange: (value: 'savings' | 'savings_out') => void;
}

const TABS: { key: 'savings' | 'savings_out'; label: string }[] = [
  { key: 'savings', label: 'Пополнение' },
  { key: 'savings_out', label: 'Вывод средств' },
];

export const SavingsTypeTabs = ({ value, disabled = false, onChange }: SavingsTypeTabsProps) => {
  const styles = useThemeStyles();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: styles.spacing.s,
        flexWrap: 'wrap',
      }}
    >
      {TABS.map((tab) => {
        const isActive = value === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            disabled={disabled}
            style={{
              flex: '1 1 0',
              padding: `${styles.spacing.s} ${styles.spacing.m}`,
              borderRadius: styles.radius.m,
              border: isActive ? 'none' : `1px solid ${styles.colors.border}`,
              backgroundColor: isActive
                ? styles.colors.accent
                : styles.colors.bgSurface,
              color: isActive ? styles.colors.bgPrimary : styles.colors.textSecondary,
              fontSize: styles.typography.fontSize.m,
              fontWeight: isActive
                ? styles.typography.fontWeight.medium
                : styles.typography.fontWeight.regular,
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export type SavingsType = 'savings' | 'savings_out';

export const savingsTypeOption = (type: OperationType): SavingsType =>
  type === 'savings_out' ? 'savings_out' : 'savings';