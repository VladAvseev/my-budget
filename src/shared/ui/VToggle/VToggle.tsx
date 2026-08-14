import { useState, type CSSProperties, type ReactNode } from 'react';
import styles from './VToggle.module.css';

export interface VToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export const VToggle = ({
  checked,
  defaultChecked,
  onChange,
  disabled,
  label,
  style,
  className,
}: VToggleProps) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);

  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const handleToggle = () => {
    if (disabled) {
      return;
    }
    const next = !isChecked;
    if (!isControlled) {
      setInternalChecked(next);
    }
    onChange?.(next);
  };

  return (
    <div className={`${styles.root}${className ? ` ${className}` : ''}`} style={style}>
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleToggle}
        className={`${styles.track}${isChecked ? ` ${styles.trackChecked}` : ''}`}
      >
        <span className={`${styles.handle}${isChecked ? ` ${styles.handleChecked}` : ''}`} />
      </button>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
};
