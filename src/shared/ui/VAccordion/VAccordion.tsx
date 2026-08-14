import { useState, type CSSProperties, type ReactNode } from 'react';
import { ChevronDownIcon } from '@/shared/icons';
import styles from './VAccordion.module.css';

export interface VAccordionProps {
  header: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
}

export const VAccordion = ({
  header,
  children,
  defaultOpen,
  disabled,
  style,
  className,
}: VAccordionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);

  const handleToggle = () => {
    if (disabled) {
      return;
    }
    setIsOpen((prev) => !prev);
  };

  const disabledAttr = disabled ? 'true' : undefined;

  return (
    <div className={`${styles.accordion}${className ? ` ${className}` : ''}`} style={style}>
      <div className={styles.header} data-disabled={disabledAttr} onClick={handleToggle}>
        <div className={styles.label} data-disabled={disabledAttr}>
          {header}
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            handleToggle();
          }}
          className={styles.chevron}
        >
          <ChevronDownIcon
            size={16}
            color="currentColor"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease',
            }}
          />
        </button>
      </div>
      <div className={`${styles.body}${isOpen ? ` ${styles.bodyOpen}` : ''}`}>
        <div className={styles.bodyInner}>{children}</div>
      </div>
    </div>
  );
};