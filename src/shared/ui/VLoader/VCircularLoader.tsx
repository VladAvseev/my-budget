import { LoaderIcon } from '@/shared/icons';
import type { CSSProperties } from 'react';
import styles from './VCircularLoader.module.css';

export interface VCircularLoaderProps {
  /** Размер в пикселях (по умолчанию 20) */
  size?: number;
  /** Цвет спиннера (по умолчанию currentColor) */
  color?: string;
  /** Пользовательский класс */
  className?: string;
  /** Inline стили */
  style?: CSSProperties;
}

/**
 * Обычный (круговой) лоадер:
 * Минималистичный вращающийся индикатор для инпутов, селектов и кнопок.
 */
export const VCircularLoader = ({
  size = 20,
  color = 'currentColor',
  className,
  style,
}: VCircularLoaderProps) => {
  return (
    <span
      role="status"
      aria-label="Загрузка"
      className={`${styles.wrapper} ${styles.spinner}${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size, color, ...style }}
    >
      <LoaderIcon size={size} color="currentColor" />
    </span>
  );
};
