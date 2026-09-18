import { type CSSProperties } from 'react';
import styles from './VLogo.module.css';

export interface VLogoProps {
  /** Размер иконки в пикселях (по умолчанию 28) */
  size?: number;
  /** Отображать ли тёмную подложку-сквиркл (по умолчанию false) */
  showBackground?: boolean;
  /** Включить ли непрерывную анимацию (для акцентных мест) */
  animated?: boolean;
  /** Пользовательский класс */
  className?: string;
  /** Inline стили */
  style?: CSSProperties;
}

/**
 * Фирменный логотип «Мои финансы»:
 * 2 динамично перекрещенные синие купюры в брендовой палитре проекта
 * с минималистичной монетой-кристаллом в центре и фирменной искоркой.
 */
export const VLogo = ({
  size = 28,
  showBackground = false,
  animated = false,
  className,
  style,
}: VLogoProps) => {
  return (
    <span
      className={`${styles.root} ${animated ? styles.animated : ''}${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
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
          <linearGradient id="vlogo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--md-sys-color-surface-container-lowest, #111416)" />
            <stop offset="100%" stopColor="var(--md-sys-color-surface-container, #1a1c1e)" />
          </linearGradient>

          {/* Задняя купюра: Глубокий синий */}
          <linearGradient id="vlogo-back" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--md-sys-color-on-primary-fixed, #001e2f)" />
            <stop offset="100%" stopColor="var(--md-sys-color-primary-container, #004b6f)" />
          </linearGradient>

          {/* Передняя купюра: Яркий брендовый синий */}
          <linearGradient id="vlogo-front" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--md-sys-color-primary-container, #004b6f)" />
            <stop offset="100%" stopColor="var(--md-sys-color-primary, #007eb6)" />
          </linearGradient>

          {/* Медальон монеты */}
          <linearGradient id="vlogo-medallion" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--md-sys-color-on-primary-fixed, #001e2f)" />
            <stop offset="100%" stopColor="var(--md-sys-color-primary-container, #004b6f)" />
          </linearGradient>

          <filter id="vlogo-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1.8" stdDeviation="2.2" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {showBackground && (
          <>
            <rect
              width="48"
              height="48"
              rx="11.25"
              fill="url(#vlogo-bg)"
            />
            <rect
              x="0.2"
              y="0.2"
              width="47.6"
              height="47.6"
              rx="11"
              fill="none"
              stroke="var(--md-sys-color-outline-variant, #282a2d)"
              strokeWidth="0.5"
            />
          </>
        )}

        {/* 1. Задняя купюра: центр в (22, 22), поворот -14° (соответствует Favicon) */}
        <g className={styles.backBill} transform="translate(22, 22) rotate(-14) translate(-16, -8.8)">
          <rect
            x="0"
            y="0"
            width="32"
            height="17.6"
            rx="2.5"
            fill="url(#vlogo-back)"
            stroke="var(--md-sys-color-primary, #007eb6)"
            strokeWidth="1.1"
            strokeOpacity="0.85"
          />
          <rect
            x="1.4"
            y="1.4"
            width="29.2"
            height="14.8"
            rx="1.3"
            fill="none"
            stroke="var(--md-sys-color-primary-fixed-dim, #8bceff)"
            strokeWidth="0.8"
            strokeOpacity="0.35"
          />
          <circle
            cx="8.5"
            cy="8.8"
            r="2.8"
            fill="none"
            stroke="var(--md-sys-color-primary-fixed-dim, #8bceff)"
            strokeWidth="0.8"
            strokeOpacity="0.25"
          />
        </g>

        {/* 2. Передняя купюра: центр в (25, 26), поворот 5° (соответствует Favicon) */}
        <g
          className={styles.frontBill}
          transform="translate(25, 26) rotate(5) translate(-17, -9.5)"
          filter="url(#vlogo-shadow)"
        >
          <rect
            x="0"
            y="0"
            width="34"
            height="19"
            rx="2.5"
            fill="url(#vlogo-front)"
            stroke="var(--md-sys-color-primary-fixed-dim, #8bceff)"
            strokeWidth="1.2"
          />
          <rect
            x="1.4"
            y="1.4"
            width="31.2"
            height="16.2"
            rx="1.4"
            fill="none"
            stroke="var(--md-sys-color-on-primary-container, #c9e6ff)"
            strokeWidth="0.8"
            strokeOpacity="0.45"
          />

          {/* Медальон: чистая минималистичная монета */}
          <circle
            cx="17"
            cy="9.5"
            r="4.8"
            fill="url(#vlogo-medallion)"
            stroke="var(--md-sys-color-primary-fixed-dim, #8bceff)"
            strokeWidth="0.9"
            className={styles.medallion}
          />

          {/* Эмблема монеты: чистый ромб с ядром */}
          <g className={styles.coinEmblem}>
            <path
              d="M 17 6.8 L 19.5 9.5 L 17 12.2 L 14.5 9.5 Z"
              fill="none"
              stroke="var(--md-sys-color-on-primary, #ffffff)"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
            <path
              d="M 17 8.2 L 18.1 9.5 L 17 10.8 L 15.9 9.5 Z"
              fill="var(--md-sys-color-on-primary-container, #c9e6ff)"
            />
          </g>

          {/* Фирменная 4-лучевая искра (звёздочка) */}
          <g transform="translate(28.5, 4.2)">
            <g className={styles.sparkle}>
              <path
                d="M 0 -2.2 Q 0 0 2.2 0 Q 0 0 0 2.2 Q 0 0 -2.2 0 Q 0 0 0 -2.2 Z"
                fill="var(--md-sys-color-on-primary-container, #c9e6ff)"
              />
            </g>
          </g>
        </g>
      </svg>
    </span>
  );
};
