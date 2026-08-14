import { useThemeStyles } from '@/shared/theme';
import { VLoader } from '@/shared/ui/VLoader';
import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface VIconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'type'
> {
  ariaLabel: string;
  onClick?: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  color?: string;
  children?: ReactNode;
}

export const VIconButton = ({
  ariaLabel,
  onClick,
  isDisabled,
  isLoading,
  color,
  children,
}: VIconButtonProps) => {
  const styles = useThemeStyles();
  const [isHovered, setIsHovered] = useState(false);
  const disabled = isDisabled || isLoading;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-busy={isLoading}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: styles.spacing.xs,
        border: 'none',
        borderRadius: styles.radius.s,
        backgroundColor: isHovered ? styles.colors.bgSurfaceHover : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled && !isLoading ? 0.5 : 1,
        transition: 'background-color 0.15s ease',
      }}
    >
      {isLoading ? <VLoader size={24} color={color} /> : children}
    </button>
  );
};
