import { useState, type HTMLAttributes, type MouseEvent } from 'react';
import { useThemeStyles } from '@/shared/theme';

export interface VCardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const VCard = ({ interactive, children, style, ...rest }: VCardProps) => {
  const styles = useThemeStyles();
  const [isHovered, setIsHovered] = useState(false);

  const isInteractive = interactive || Boolean(rest.onClick) || rest.role === 'button';

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    rest.onMouseEnter?.(event);
  };

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    setIsHovered(false);
    rest.onMouseLeave?.(event);
  };

  return (
    <div
      {...rest}
      onMouseEnter={isInteractive ? handleMouseEnter : rest.onMouseEnter}
      onMouseLeave={isInteractive ? handleMouseLeave : rest.onMouseLeave}
      style={{
        backgroundColor: isHovered ? styles.colors.bgSurfaceHover : styles.colors.bgSurface,
        borderRadius: styles.radius.l,
        boxShadow: isHovered ? styles.shadow.l : styles.shadow.m,
        border: `1px solid ${styles.colors.border}`,
        padding: styles.spacing.m,
        transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
        ...(isInteractive ? { cursor: 'pointer' } : null),
        ...style,
      }}
    >
      {children}
    </div>
  );
};