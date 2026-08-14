import type { CSSProperties, ReactNode } from 'react';
import { COLOR_PALETTE_BG_ALPHA, withAlpha } from '@/shared/colors';
import styles from './VBadge.module.css';

export type VBadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface VBadgeProps {
  children?: ReactNode;
  variant?: VBadgeVariant;
  color?: string;
  style?: CSSProperties;
  className?: string;
}

export const VBadge = ({ children, variant = 'neutral', color, style, className }: VBadgeProps) => {
  const extraClass = className ? ` ${className}` : '';

  if (color) {
    return (
      <span
        className={`${styles.badge}${extraClass}`}
        style={{
          color: 'var(--color-text-primary)',
          backgroundColor: withAlpha(color, COLOR_PALETTE_BG_ALPHA),
          borderColor: color,
          ...style,
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <span className={`${styles.badge} ${styles[variant]}${extraClass}`} style={style}>
      {children}
    </span>
  );
};