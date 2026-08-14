import { VLoader } from '@/shared/ui/VLoader';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './VIconButton.module.css';

export interface VIconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'type' | 'className'
> {
  ariaLabel: string;
  onClick?: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  color?: string;
  children?: ReactNode;
  className?: string;
}

export const VIconButton = ({
  ariaLabel,
  onClick,
  isDisabled,
  isLoading,
  color,
  children,
  className,
}: VIconButtonProps) => {
  const disabled = isDisabled || isLoading;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-busy={isLoading}
      disabled={disabled}
      onClick={onClick}
      className={`${styles.button}${className ? ` ${className}` : ''}`}
      style={color ? { color } : undefined}
    >
      {isLoading ? <VLoader size={24} color={color} /> : children}
    </button>
  );
};