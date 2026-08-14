import type { CSSProperties } from 'react';
import { LoaderIcon } from '@/shared/icons';
import styles from './VLoader.module.css';

export interface VLoaderProps {
  size?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
}

export const VLoader = ({ size = 20, color, style, className }: VLoaderProps) => {
  return (
    <span
      role="status"
      aria-label="Загрузка"
      className={`${styles.wrapper} ${styles.spinner}${className ? ` ${className}` : ''}`}
      style={{ color: color ?? undefined, ...style }}
    >
      <LoaderIcon size={size} color="currentColor" />
    </span>
  );
};