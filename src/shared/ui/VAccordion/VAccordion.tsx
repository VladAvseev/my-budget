import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ChevronDownIcon } from '@/shared/icons';
import { useThemeStyles } from '@/shared/theme';

export interface VAccordionProps {
  header: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
}

export const VAccordion = ({
  header,
  children,
  defaultOpen,
  disabled,
  style,
}: VAccordionProps) => {
  const styles = useThemeStyles();
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);
  const [isHovered, setIsHovered] = useState(false);
  const [bodyHeight, setBodyHeight] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (bodyRef.current) {
      setBodyHeight(isOpen ? bodyRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) {
      return;
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      style={{
        width: '100%',
        borderRadius: styles.radius.m,
        backgroundColor: isHovered ? styles.colors.bgSurfaceHover : styles.colors.bgSurface,
        boxShadow: styles.shadow.m,
        transition: 'background-color 0.15s ease',
        ...style,
      }}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: styles.spacing.m,
          width: '100%',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: `${styles.spacing.s} ${styles.spacing.m}`,
            fontSize: styles.typography.fontSize.m,
            color: styles.colors.textPrimary,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {header}
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            handleToggle();
          }}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifySelf: 'center',
            margin: styles.spacing.s,
            padding: 0,
            border: 'none',
            background: 'transparent',
            font: 'inherit',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <ChevronDownIcon
            size={16}
            color={isHovered && !disabled ? styles.colors.accent : styles.colors.textSecondary}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease, color 0.15s ease',
            }}
          />
        </button>
      </div>
      <div
        style={{
          height: bodyHeight,
          overflow: 'hidden',
          transition: 'height 0.2s ease',
        }}
      >
        <div
          ref={bodyRef}
          style={{
            padding: `${styles.spacing.s} ${styles.spacing.m} ${styles.spacing.m} ${styles.spacing.m}`,
            fontSize: styles.typography.fontSize.m,
            color: styles.colors.textSecondary,
            borderRadius: `0 0 ${styles.radius.m} ${styles.radius.m}`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};