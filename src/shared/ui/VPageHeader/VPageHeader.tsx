import { useThemeStyles } from '@/shared/theme';
import { BackButton } from '@/shared/ui/BackButton';
import type { ReactNode } from 'react';

export interface VPageHeaderProps {
  title: string;
  onBack?: () => void;
  backAriaLabel?: string;
  right?: ReactNode;
}

export const VPageHeader = ({ title, onBack, backAriaLabel, right }: VPageHeaderProps) => {
  const styles = useThemeStyles();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: styles.spacing.m,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: styles.spacing.m }}>
        {onBack && (
          <BackButton ariaLabel={backAriaLabel ?? 'Назад'} onClick={onBack} />
        )}
        <div
          style={{
            fontSize: styles.typography.fontSize.xxl,
            fontWeight: styles.typography.fontWeight.bold,
            color: styles.colors.textPrimary,
          }}
        >
          {title}
        </div>
      </div>
      {right}
    </div>
  );
};