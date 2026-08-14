import { EyeIcon, EyeOffIcon } from '@/shared/icons';
import { VTextInput } from '@/shared/ui/VTextInput';
import { useState } from 'react';
import styles from './VPasswordInput.module.css';

export interface VPasswordInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const VPasswordInput = ({
  label,
  placeholder,
  value,
  error,
  disabled,
  autoComplete,
  onChange,
  className,
}: VPasswordInputProps) => {
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
      className={className}
      trailingIcon={
        <button
          type="button"
          aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
          onClick={() => setIsVisible((prev) => !prev)}
          disabled={disabled}
          className={styles.toggle}
        >
          {isVisible ? <EyeOffIcon size={18} color="currentColor" /> : <EyeIcon size={18} color="currentColor" />}
        </button>
      }
    />
  );
};
