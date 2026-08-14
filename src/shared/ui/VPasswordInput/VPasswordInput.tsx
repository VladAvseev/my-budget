import { EyeIcon, EyeOffIcon } from '@/shared/icons';
import { useThemeStyles } from '@/shared/theme';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useState } from 'react';

export interface VPasswordInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
  onChange?: (value: string) => void;
}

export const VPasswordInput = ({
  label,
  placeholder,
  value,
  error,
  disabled,
  autoComplete,
  onChange,
}: VPasswordInputProps) => {
  const styles = useThemeStyles();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <VTextInput
      label={label}
      type={isVisible ? 'text' : 'password'}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      error={error}
      disabled={disabled}
      onChange={onChange}
      trailingIcon={
        <button
          type="button"
          aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
          onClick={() => setIsVisible((prev) => !prev)}
          disabled={disabled}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            border: 'none',
            background: 'transparent',
            color: styles.colors.textSecondary,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {isVisible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      }
    />
  );
};
