import type { CSSProperties, ReactNode } from 'react';
import styles from './VButtonGroup.module.css';

export interface VButtonGroupOption {
  value: any;
  label: string;
  prefix?: ReactNode;
}

export interface VButtonGroupProps {
  options: VButtonGroupOption[];
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  style?: CSSProperties;
  fullWidth?: boolean;
}

export const VButtonGroup = ({
  options,
  value,
  onChange,
  disabled = false,
  label,
  className,
  style,
  fullWidth = false,
}: VButtonGroupProps) => (
  <div
    className={`${styles.container}${className ? ` ${className}` : ''}${fullWidth ? ` ${styles.fullWidth}` : ''}`}
    style={style}
  >
    {label && <div className={styles.label}>{label}</div>}
    <div className={`${styles.buttons}${fullWidth ? ` ${styles.buttonsFullWidth}` : ''}`}>
      {options.map((option) => (
        <button
          key={option.value as string}
          type="button"
          className={`${styles.button}${value === option.value ? ` ${styles.active}` : ''}`}
          disabled={disabled}
          onClick={() => onChange(option.value)}
        >
          {option.prefix && <span className={styles.prefix}>{option.prefix}</span>}
          {option.label}
        </button>
      ))}
    </div>
  </div>
);
