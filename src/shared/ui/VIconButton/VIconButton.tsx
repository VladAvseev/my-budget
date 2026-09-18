import { VLoader } from '@/shared/ui/VLoader';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './VIconButton.module.css';

export type VIconButtonVariant = 'standard' | 'filled' | 'filled-tonal' | 'outlined';

export interface VIconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'type' | 'className'
> {
  ariaLabel: string;
  onClick?: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  variant?: VIconButtonVariant;
  color?: string;
  children?: ReactNode;
  className?: string;
}

export const VIconButton = ({
  ariaLabel,
  onClick,
  isDisabled,
  isLoading,
  variant = 'standard',
  color,
  children,
  className,
  ...rest
}: VIconButtonProps) => {
  const disabled = isDisabled || isLoading;

  const variantClass = {
    standard: styles.standard,
    filled: styles.filled,
    'filled-tonal': styles.filledTonal,
    outlined: styles.outlined,
  }[variant];

  const loaderColor =
    color ?? (variant === 'filled' ? 'var(--md-sys-color-on-primary)' : 'currentColor');

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-busy={isLoading}
      disabled={disabled}
      onClick={onClick}
      className={`${styles.button} ${variantClass}${className ? ` ${className}` : ''}`}
      style={color ? { color } : undefined}
      {...rest}
    >
      {isLoading ? <VLoader size={20} color={loaderColor} /> : children}
    </button>
  );
};

