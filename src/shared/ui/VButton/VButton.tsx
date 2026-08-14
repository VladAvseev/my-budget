import { VLoader } from '@/shared/ui/VLoader';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './VButton.module.css';

export type VButtonVariant = 'primary' | 'secondary' | 'danger';

export interface VButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'type'
> {
  children?: ReactNode;
  variant?: VButtonVariant;
  isDisabled?: boolean;
  isLoading?: boolean;
  onClick?: any;
}

export const VButton = ({
  children,
  variant = 'primary',
  isDisabled,
  isLoading,
  onClick,
  style,
  ...rest
}: VButtonProps) => {
  const disabled = isDisabled || isLoading;
  const { className: passedClassName, ...restProps } = rest;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-busy={isLoading}
      onClick={onClick}
      className={`${styles.base} ${styles[variant]}${passedClassName ? ` ${passedClassName}` : ''}`}
      style={style}
      {...restProps}
    >
      <span className={isLoading ? styles.contentHidden : styles.content}>
        {children}
      </span>
      {isLoading && (
        <span className={styles.loader}>
          <VLoader color="currentColor" />
        </span>
      )}
    </button>
  );
};
