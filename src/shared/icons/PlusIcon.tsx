import type { IconProps } from './types';

export const PlusIcon = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);
