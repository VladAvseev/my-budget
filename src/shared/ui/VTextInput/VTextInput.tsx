import { useId, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { useThemeStyles } from '@/shared/theme';

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
  onMouseEnter,
  onMouseLeave,
  disabled,
  style,
  trailingIcon,
  ...rest
}: VTextInputProps) => {
  const styles = useThemeStyles();
  const errorId = useId();
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasError = Boolean(error);

  const borderColor = hasError
    ? styles.colors.error
    : isFocused
      ? styles.colors.accent
      : isHovered
        ? styles.colors.textSecondary
        : styles.colors.border;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    let nextValue = event.target.value;
    if (numeric) {
      nextValue = normalizeNumeric(nextValue);
    }
    onChange?.(nextValue);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.xs, ...style }}>
      {label && (
        <label
          style={{
            fontSize: styles.typography.fontSize.s,
            fontWeight: styles.typography.fontWeight.medium,
            color: styles.colors.textSecondary,
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        <input
          value={value}
          onChange={handleChange}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onMouseEnter={(e) => {
            setIsHovered(true);
            onMouseEnter?.(e);
          }}
          onMouseLeave={(e) => {
            setIsHovered(false);
            onMouseLeave?.(e);
          }}
          style={{
            padding: styles.spacing.s,
            paddingRight: trailingIcon ? 40 : styles.spacing.s,
            width: '100%',
            borderRadius: styles.radius.m,
            fontSize: styles.typography.fontSize.m,
            backgroundColor: styles.colors.bgSurface,
            color: styles.colors.textPrimary,
            border: `1px solid ${borderColor}`,
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'auto',
            opacity: disabled ? 0.5 : 1,
            transition: 'border-color 0.15s ease',
          }}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          {...rest}
        />
        {trailingIcon && (
          <span
            style={{
              position: 'absolute',
              right: styles.spacing.s,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            {trailingIcon}
          </span>
        )}
      </div>
      {hasError && (
        <span id={errorId} style={{ fontSize: styles.typography.fontSize.s, color: styles.colors.error }}>
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