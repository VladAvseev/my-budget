import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
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
  const [bodyHeight, setBodyHeight] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (bodyRef.current) {
      setBodyHeight(isOpen ? bodyRef.current.scrollHeight : 0);
    }
  }, [isOpen, children]);

  const handleToggle = () => {
    if (disabled) {
      return;
    }
    setIsOpen((prev) => !prev);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  const disabledAttr = disabled ? 'true' : undefined;

  return (
    <div
      className={`${styles.accordion}${className ? ` ${className}` : ''}`}
      style={style}
      data-open={isOpen ? 'true' : undefined}
    >
      <div
        className={styles.header}
        data-disabled={disabledAttr}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-disabled={disabled}
      >
        <div className={styles.label} data-disabled={disabledAttr}>
          {header}
        </div>
        <button
          type="button"
          disabled={disabled}
          tabIndex={-1}
          onClick={(event) => {
            event.stopPropagation();
            handleToggle();
          }}
          className={styles.chevron}
          aria-hidden="true"
        >
          <span className={styles.chevronIcon}>
            <ChevronDownIcon size={16} color="currentColor" />
          </span>
        </button>
      </div>
      <div
        className={styles.body}
        style={{ height: bodyHeight }}
        aria-hidden={!isOpen}
        data-open={isOpen ? 'true' : undefined}
      >
        <div ref={bodyRef} className={styles.bodyInner}>
          {children}
        </div>
      </div>
    </div>
  );
};
