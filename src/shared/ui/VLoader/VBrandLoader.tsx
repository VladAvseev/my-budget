import type { CSSProperties } from 'react';
import styles from './VBrandLoader.module.css';

export interface VBrandLoaderProps {
  /** Размер лоадера в пикселях (по умолчанию 48) */
  size?: number;
  /** Пользовательский класс */
  className?: string;
  /** Inline стили */
  style?: CSSProperties;
}

/**
 * Брендовый анимированный лоадер «Мои финансы»:
 * Две синие купюры с минималистичной монетой-кристаллом в центре,
 * вращающиеся строго вокруг геометрического центра иконки без выхода элементов за границы.
 */
export const VBrandLoader = ({
  size = 48,
  className,
  style,
}: VBrandLoaderProps) => {
  return (
    <span
      role="status"
      aria-label="Загрузка страницы"
      className={`${styles.wrapper}${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size, ...style }}
    >
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
      >
        <defs>
          {/* Задняя купюра: Глубокий синий */}
          <linearGradient id="vbrand-loader-back" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--md-sys-color-on-primary-fixed, #001e2f)" />
            <stop offset="100%" stopColor="var(--md-sys-color-primary-container, #004b6f)" />
          </linearGradient>

          {/* Передняя купюра: Яркий брендовый синий */}
          <linearGradient id="vbrand-loader-front" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--md-sys-color-primary-container, #004b6f)" />
            <stop offset="100%" stopColor="var(--md-sys-color-primary, #007eb6)" />
          </linearGradient>

          {/* Медальон монеты */}
          <linearGradient id="vbrand-loader-coin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--md-sys-color-on-primary-fixed, #001e2f)" />
            <stop offset="100%" stopColor="var(--md-sys-color-primary-container, #004b6f)" />
          </linearGradient>

          {/* Мягкая тень глубины M3 */}
          <filter id="vbrand-loader-shadow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Вращающийся кластер строго вокруг центра (24, 24) */}
        <g className={styles.rotatingCluster}>
          {/* 1. Задняя купюра: центр в (24, 24) */}
          <g className={styles.backBill} transform="rotate(-14 24 24)">
            <rect
              x="8"
              y="15.2"
              width="32"
              height="17.6"
              rx="2.5"
              fill="url(#vbrand-loader-back)"
              stroke="var(--md-sys-color-primary, #007eb6)"
              strokeWidth="1.1"
              strokeOpacity="0.85"
            />
            <rect
              x="9.4"
              y="16.6"
              width="29.2"
              height="14.8"
              rx="1.3"
              fill="none"
              stroke="var(--md-sys-color-primary-fixed-dim, #8bceff)"
              strokeWidth="0.8"
              strokeOpacity="0.35"
            />
            <circle
              cx="16.5"
              cy="24"
              r="2.8"
              fill="none"
              stroke="var(--md-sys-color-primary-fixed-dim, #8bceff)"
              strokeWidth="0.8"
              strokeOpacity="0.25"
            />
          </g>

          {/* 2. Передняя купюра: центр в (24, 24) */}
          <g className={styles.frontBill} transform="rotate(5 24 24)" filter="url(#vbrand-loader-shadow)">
            <rect
              x="7"
              y="14.5"
              width="34"
              height="19"
              rx="2.5"
              fill="url(#vbrand-loader-front)"
              stroke="var(--md-sys-color-primary-fixed-dim, #8bceff)"
              strokeWidth="1.2"
            />
            <rect
              x="8.4"
              y="15.9"
              width="31.2"
              height="16.2"
              rx="1.4"
              fill="none"
              stroke="var(--md-sys-color-on-primary-container, #c9e6ff)"
              strokeWidth="0.8"
              strokeOpacity="0.45"
            />

            {/* Медальон: чистая монета строго в центре купюры (24, 24) */}
            <circle
              cx="24"
              cy="24"
              r="4.8"
              fill="url(#vbrand-loader-coin)"
              stroke="var(--md-sys-color-primary-fixed-dim, #8bceff)"
              strokeWidth="0.9"
              className={styles.coinGlow}
            />

            {/* Эмблема монеты: чистый ромб с ядром */}
            <g className={styles.coinGlow}>
              <path
                d="M 24 21.3 L 26.5 24 L 24 26.7 L 21.5 24 Z"
                fill="none"
                stroke="var(--md-sys-color-on-primary, #ffffff)"
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
              <path
                d="M 24 22.7 L 25.1 24 L 24 25.3 L 22.9 24 Z"
                fill="var(--md-sys-color-on-primary-container, #c9e6ff)"
              />
            </g>

            {/* Фирменная 4-лучевая искра (звёздочка): жестко привязана к позиции (35.5, 18.7) внутри купюры */}
            <g transform="translate(35.5, 18.7)">
              <g className={styles.sparkle}>
                <path
                  d="M 0 -2.2 Q 0 0 2.2 0 Q 0 0 0 2.2 Q 0 0 -2.2 0 Q 0 0 0 -2.2 Z"
                  fill="var(--md-sys-color-on-primary-container, #c9e6ff)"
                />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </span>
  );
};
