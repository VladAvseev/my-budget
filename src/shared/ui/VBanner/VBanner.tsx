import { ClearIcon } from '@/shared/icons';
import type { CSSProperties } from 'react';
import styles from './VBanner.module.css';

export type VBannerType = 'success' | 'warning' | 'error';

export interface VBannerProps {
  type?: VBannerType;
  visible: boolean;
  message: string;
  style?: CSSProperties;
  className?: string;
  onClose?: () => void;
}

export const VBanner = ({
  type = 'success',
  visible,
  message,
  onClose,
  style,
  className,
}: VBannerProps) => {
  if (!visible) {
    return null;
  }

  return (
    <div
      role="status"
      className={`${styles.banner} ${styles[type]}${className ? ` ${className}` : ''}`}
      style={style}
    >
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          aria-label="Закрыть"
          onClick={onClose}
          className={styles.close}
        >
          <ClearIcon size={16} color="currentColor" />
        </button>
      )}
    </div>
  );
};