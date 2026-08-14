import type { IconProps } from './types';

export const LoaderIcon = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    style={style}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);