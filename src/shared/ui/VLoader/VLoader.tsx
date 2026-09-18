import type { CSSProperties } from 'react';
import { VBrandLoader } from './VBrandLoader';
import { VCircularLoader } from './VCircularLoader';

export interface VLoaderProps {
  /** Размер лоадера в пикселях (по умолчанию 28) */
  size?: number;
  /** Вариант: 'brand' (анимированные купюры) или 'circular' (обычный спиннер) */
  variant?: 'brand' | 'circular';
  /** Цвет (для circular-режима) */
  color?: string;
  /** Inline стили */
  style?: CSSProperties;
  /** Пользовательский класс */
  className?: string;
}

/**
 * Лоадер приложения:
 * - 'brand' (по умолчанию для страниц): фирменные синие купюры с монетой и орбитальным вращением.
 * - 'circular' (обычный): круговой спиннер для инпутов, селектов и кнопок.
 */
export const VLoader = ({
  size = 28,
  variant,
  color,
  style,
  className,
}: VLoaderProps) => {
  const resolvedVariant =
    variant ?? (color === 'currentColor' && size <= 20 ? 'circular' : 'brand');

  if (resolvedVariant === 'circular') {
    return <VCircularLoader size={size} color={color} className={className} style={style} />;
  }

  return <VBrandLoader size={size} className={className} style={style} />;
};
