import { useId, type ChangeEvent, type TextareaHTMLAttributes, type ReactNode } from 'react';
import styles from './VTextArea.module.css';

export interface VTextAreaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange'
> {
  label?: string;
  error?: string;
  trailingIcon?: ReactNode;
  onChange?: (value: string) => void;
}

export const VTextArea = ({
  label,
  error,
  value,
  onChange,
  onFocus,
  onBlur,
  style,
  trailingIcon,
  className,
  ...rest
}: VTextAreaProps) => {
  const errorId = useId();
  const hasError = Boolean(error);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <div className={`${styles.root}${className ? ` ${className}` : ''}`} style={style}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.wrapper}>
        <textarea
          value={value}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          maxLength={255}
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
