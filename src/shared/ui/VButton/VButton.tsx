import { useThemeStyles } from '@/shared/theme';
import { VLoader } from '@/shared/ui/VLoader';
import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';

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
  const styles = useThemeStyles();
  const [isHovered, setIsHovered] = useState(false);
  const disabled = isDisabled || isLoading;

  const variantStyles: Record<VButtonVariant, { backgroundColor: string; border: string }> = {
    primary: {
      backgroundColor: isHovered ? styles.colors.accentHover : styles.colors.accent,
      border: 'none',
    },
    secondary: {
      backgroundColor: isHovered ? styles.colors.accentLight : 'transparent',
      border: `1px solid ${styles.colors.accent}`,
    },
    danger: {
      backgroundColor: isHovered ? styles.colors.errorHover : styles.colors.error,
      border: 'none',
    },
  };

  const color =
    variant === 'secondary'
      ? styles.colors.accent
      : styles.colors.bgPrimary;

  const { backgroundColor, border } = variantStyles[variant];

  return (
    <button
      type="button"
      disabled={disabled}
      aria-busy={isLoading}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        padding: `${styles.spacing.s} ${styles.spacing.l}`,
        borderRadius: styles.radius.m,
        fontSize: styles.typography.fontSize.m,
        fontWeight: styles.typography.fontWeight.medium,
        fontFamily: 'inherit',
        backgroundColor,
        color,
        border,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled && !isLoading ? 0.5 : 1,
        transition: 'background-color 0.15s ease, color 0.15s ease',
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          visibility: isLoading ? 'hidden' : 'visible',
        }}
      >
        {children}
      </span>
      {isLoading && (
        <span
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <VLoader color={color} />
        </span>
      )}
    </button>
  );
};
