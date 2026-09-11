import type { CSSProperties } from 'react';
import styles from './VSkeleton.module.css';

export interface VSkeletonProps {
  /** Ширина блока: число — в px, строка — как CSS-значение ('60%', '100%'). */
  width?: number | string;
  /** Высота блока: число — в px, строка — как CSS-значение. */
  height?: number | string;
  /** Радиус скругления (CSS-значение). */
  radius?: string;
  /** Круглый блок (аватар). */
  circle?: boolean;
  className?: string;
  style?: CSSProperties;
}

const toCss = (value: number | string | undefined) =>
  typeof value === 'number' ? `${value}px` : value;

/** Базовый пульсирующий блок-заглушка. */
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
