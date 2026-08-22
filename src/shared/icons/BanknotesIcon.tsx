import type { IconProps } from './types';

export const BanknotesIcon = ({ size = 16, color = 'currentColor', style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <rect x="2.7" y="9.2" width="16" height="9" rx="1.5" transform="rotate(-16 5.2 8.2)" />
    <rect x="3.7" y="7.7" width="16" height="9" rx="1.5" />
    <circle cx="11.7" cy="12.2" r="2" />
  </svg>
);
