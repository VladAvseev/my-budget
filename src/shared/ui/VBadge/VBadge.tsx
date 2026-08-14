import type { CSSProperties, ReactNode } from 'react';
import { COLOR_PALETTE_BG_ALPHA, withAlpha } from '@/shared/colors';
import { useThemeStyles } from '@/shared/theme';

export type VBadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface VBadgeProps {
  children?: ReactNode;
  variant?: VBadgeVariant;
  color?: string;
  style?: CSSProperties;
}

export const VBadge = ({ children, variant = 'neutral', color, style }: VBadgeProps) => {
  const styles = useThemeStyles();

  const variantStyles: Record<
    VBadgeVariant,
    { color: string; backgroundColor: string; borderColor: string }
  > = {
    neutral: {
      color: styles.colors.textSecondary,
      backgroundColor: styles.colors.bgSurface,
      borderColor: styles.colors.border,
    },
    accent: {
      color: styles.colors.accent,
      backgroundColor: styles.colors.accentLight,
      borderColor: 'transparent',
    },
    success: {
      color: styles.colors.success,
      backgroundColor: styles.colors.successBg,
      borderColor: styles.colors.successBorder,
    },
    warning: {
      color: styles.colors.warning,
      backgroundColor: styles.colors.warningBg,
      borderColor: styles.colors.warningBorder,
    },
    danger: {
      color: styles.colors.error,
      backgroundColor: styles.colors.errorBg,
      borderColor: styles.colors.errorBorder,
    },
  };

  const { color: textColor, backgroundColor, borderColor } = color
    ? {
        color: styles.colors.textPrimary,
        backgroundColor: withAlpha(color, COLOR_PALETTE_BG_ALPHA),
        borderColor: color,
      }
    : variantStyles[variant];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        padding: `${styles.spacing.xs} ${styles.spacing.s}`,
        borderRadius: styles.radius.s,
        fontSize: styles.typography.fontSize.s,
        fontWeight: styles.typography.fontWeight.medium,
        lineHeight: styles.typography.lineHeight.tight,
        color: textColor,
        backgroundColor,
        border: `1px solid ${borderColor}`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};