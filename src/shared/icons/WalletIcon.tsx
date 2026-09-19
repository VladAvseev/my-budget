import type { IconProps } from './types';

export const WalletIcon = ({ size = 18, color = 'currentColor', style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 -960 960 960"
    fill={color}
    style={style}
  >
    <path d="M200-160q-33 0-56.5-23.5T120-240v-480q0-33 23.5-56.5T200-800h560q33 0 56.5 23.5T840-720v80H560q-50 0-85 35t-35 85v160q0 50 35 85t85 35h280v80q0 33-23.5 56.5T760-160H200Zm0-80h560v-40H560q-83 0-141.5-58.5T360-480q0-83 58.5-141.5T560-680h200v-40H200v480Zm360-160h280v-160H560q-17 0-28.5 11.5T520-520q0 17 11.5 28.5T560-400Zm120-40q17 0 28.5-11.5T720-480q0-17-11.5-28.5T680-520q-17 0-28.5 11.5T640-480q0 17 11.5 28.5T680-440ZM200-240v-480 480Z" />
  </svg>
);
