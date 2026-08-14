import { useId, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './VTextInput.module.css';

export interface VTextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  numeric?: boolean;
  trailingIcon?: ReactNode;
  onChange?: (value: string) => void;
}

export const VTextInput = ({
  label,
  error,
  numeric,
  value,
  onChange,
  onFocus,
  onBlur,
  style,
  trailingIcon,
  className,
  ...rest
}: VTextInputProps) => {
  const errorId = useId();
  const hasError = Boolean(error);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    let nextValue = event.target.value;
    if (numeric) {
      nextValue = normalizeNumeric(nextValue);
    }
    onChange?.(nextValue);
  };

  return (
    <div className={`${styles.root}${className ? ` ${className}` : ''}`} style={style}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.wrapper}>
        <input
          value={value}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`${styles.input}${trailingIcon ? ` ${styles.inputWithTrailing}` : ''}`}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          {...rest}
        />
        {trailingIcon && <span className={styles.trailing}>{trailingIcon}</span>}
      </div>
      {hasError && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
};

function normalizeNumeric(value: string): string {
  const normalized = value.replace(/,/g, '.');
  const parts = normalized.split('.');
  if (parts.length > 2) {
    return `${parts[0]}.${parts[1].replace(/\D/g, '')}`;
  }
  const integer = parts[0].replace(/\D/g, '');
  if (parts.length < 2) {
    return integer;
  }
  const fraction = parts[1].replace(/\D/g, '').slice(0, 2);
  return `${integer}.${fraction}`;
}
