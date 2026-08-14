import type { IconProps } from './types';

export const OverviewIcon = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <line x1="3" y1="3" x2="3" y2="21" />
    <line x1="3" y1="21" x2="21" y2="21" />
    <rect x="7" y="11" width="3" height="7" rx="1" />
    <rect x="12" y="6" width="3" height="12" rx="1" />
    <rect x="17" y="14" width="3" height="4" rx="1" />
  </svg>
);
