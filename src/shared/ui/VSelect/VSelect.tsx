import { ChevronDownIcon, ClearIcon } from '@/shared/icons';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './VSelect.module.css';

export interface VSelectOption {
  value: string;
  label: string;
  prefix?: ReactNode;
}

export interface VSelectProps {
  label?: string;
  options: VSelectOption[];
  value?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
  style?: CSSProperties;
  className?: string;
}

export const VSelect = ({
  label,
  options,
  value = '',
  placeholder,
  error,
  disabled,
  required,
  onChange,
  style,
  className,
}: VSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasError = Boolean(error);
  const hasValue = value !== '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder ?? '';

  const handleSelect = (optionValue: string) => {
    setIsOpen(false);
    onChange?.(optionValue);
  };

  return (
    <div ref={containerRef} className={`${styles.root}${className ? ` ${className}` : ''}`} style={style}>
      {label && <label className={styles.label}>{label}</label>}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-invalid={hasError}
        aria-haspopup="listbox"
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        className={styles.trigger}
        data-has-value={hasValue ? 'true' : undefined}
        data-open={isOpen ? 'true' : undefined}
        data-invalid={hasError ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
      >
        <span className={styles.triggerText}>
          {selectedOption?.prefix}
          <span className={styles.triggerTextValue}>{displayText}</span>
        </span>
        <span className={styles.triggerActions}>
          {hasValue && !disabled && !required && (
            <button
              type="button"
              aria-label="Очистить"
              onClick={(event) => {
                event.stopPropagation();
                handleSelect('');
              }}
              className={styles.clearButton}
            >
              <ClearIcon size={16} color="currentColor" />
            </button>
          )}
          <span
            className={styles.chevron}
            style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
          >
            <ChevronDownIcon size={16} color="currentColor" />
          </span>
        </span>
      </div>
      {isOpen && !disabled && (
        <div role="listbox" className={styles.dropdown}>
          {options.map((option) => (
            <Option
              key={option.value}
              option={option}
              isSelected={option.value === value}
              onClick={() => handleSelect(option.value)}
            />
          ))}
        </div>
      )}
      {hasError && <span className={styles.error}>{error}</span>}
    </div>
  );
};

interface OptionProps {
  option: VSelectOption;
  isSelected: boolean;
  onClick: () => void;
}

const Option = ({ option, isSelected, onClick }: OptionProps) => {
  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={onClick}
      className={styles.option}
      data-selected={isSelected ? 'true' : undefined}
    >
      {option.prefix}
      <span className={styles.optionText}>{option.label}</span>
    </div>
  );
};