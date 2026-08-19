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
    <rect x="6" y="10.5" width="16" height="9" rx="1.5" transform="rotate(-16 8.5 9.5)" />
    <rect x="7" y="9" width="16" height="9" rx="1.5" />
    <circle cx="15" cy="13.5" r="2" />
  </svg>
);
