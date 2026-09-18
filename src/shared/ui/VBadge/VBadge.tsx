import type { CSSProperties, ReactNode } from 'react';
import { COLOR_PALETTE_BG_ALPHA, withAlpha } from '@/shared/colors';
import styles from './VBadge.module.css';

export type VBadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface VBadgeProps {
  children?: ReactNode;
  variant?: VBadgeVariant;
  color?: string;
  title?: string;
  style?: CSSProperties;
  className?: string;
}

export const VBadge = ({
  children,
  variant = 'neutral',
  color,
  title,
  style,
  className,
}: VBadgeProps) => {
  const extraClass = className ? ` ${className}` : '';

  if (color) {
    return (
      <span
        className={`${styles.badge}${extraClass}`}
        title={title}
        style={{
          color: 'var(--md-sys-color-on-surface)',
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
    <span className={`${styles.badge} ${styles[variant]}${extraClass}`} title={title} style={style}>
      {children}
    </span>
  );
};
