import { ClearIcon } from '@/shared/icons';
import { useThemeStyles } from '@/shared/theme';
import type { CSSProperties } from 'react';

export type VBannerType = 'success' | 'warning' | 'error';

export interface VBannerProps {
  type?: VBannerType;
  visible: boolean;
  message: string;
  style?: CSSProperties;
  onClose?: () => void;
}

export const VBanner = ({
  type = 'success',
  visible,
  message,
  onClose,
  style,
}: VBannerProps) => {
  const styles = useThemeStyles();

  if (!visible) {
    return null;
  }

  const color = styles.colors[type];
  const backgroundColor = styles.colors[`${type}Bg`];
  const borderColor = styles.colors[`${type}Border`];

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: styles.spacing.m,
        padding: `${styles.spacing.m} ${styles.spacing.l}`,
        borderRadius: styles.radius.m,
        backgroundColor,
        border: `1px solid ${borderColor}`,
        color,
        fontSize: styles.typography.fontSize.m,
        fontWeight: styles.typography.fontWeight.medium,
        boxShadow: styles.shadow.s,
        animation: 'vbanner-in 0.25s ease',
        ...style
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          aria-label="Закрыть"
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <ClearIcon size={16} color={color} />
        </button>
      )}
    </div>
  );
};