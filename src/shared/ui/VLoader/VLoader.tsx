import type { CSSProperties } from 'react';
import { VCircularLoader } from './VCircularLoader';

export interface VLoaderProps {
  /** Размер лоадера в пикселях (по умолчанию 28) */
  size?: number;
  /**
   * @deprecated Оставлен для обратной совместимости: брендовый вариант больше
   * не используется, VLoader всегда рендерит обычный круговой спиннер.
   * Брендовый VBrandLoader применяется только в AsyncPage при загрузке чанков.
   */
  variant?: 'brand' | 'circular';
  /** Цвет спиннера */
  color?: string;
  /** Inline стили */
  style?: CSSProperties;
  /** Пользовательский класс */
  className?: string;
}

/**
 * Обычный круговой лоадер для всего интерфейса:
 * кнопок, инпутов, селектов, карточек и полноэкранных гардов.
 * Брендовый VBrandLoader используется только при загрузке чанков страниц (AsyncPage).
 */
export const VLoader = ({ size = 28, color, style, className }: VLoaderProps) => {
  return <VCircularLoader size={size} color={color} className={className} style={style} />;
};
