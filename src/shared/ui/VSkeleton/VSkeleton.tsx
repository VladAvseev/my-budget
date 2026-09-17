import type { CSSProperties } from 'react';
import styles from './VSkeleton.module.css';

export interface VSkeletonProps {

  width?: number | string;

  height?: number | string;

  radius?: string;

  circle?: boolean;
  className?: string;
  style?: CSSProperties;
}

const toCss = (value: number | string | undefined) =>
  typeof value === 'number' ? `${value}px` : value;

export const VSkeleton = ({ width, height, radius, circle, className, style }: VSkeletonProps) => (
  <span
    aria-hidden="true"
    className={`${styles.block}${circle ? ` ${styles.circle}` : ''}${className ? ` ${className}` : ''}`}
    style={{
      width: toCss(width),
      height: toCss(height),
      borderRadius: circle ? undefined : radius,
      ...style,
    }}
  />
);
