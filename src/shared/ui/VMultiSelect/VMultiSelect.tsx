import { CheckIcon, ChevronDownIcon, ClearIcon } from '@/shared/icons';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './VMultiSelect.module.css';

export interface VMultiSelectOption {
  value: string;
  label: string;
  prefix?: ReactNode;
}

export interface VMultiSelectProps {
  label?: string;
  options: VMultiSelectOption[];
  value: string[];
  placeholder?: string;
  emptyText?: string;
  selectAll?: boolean;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  onChange?: (values: string[]) => void;
  onOpen?: () => void;
  onClose?: () => void;
  style?: CSSProperties;
  className?: string;
}

export const VMultiSelect = ({
  label,
  options,
  value = [],
  placeholder = 'Выберите',
  emptyText = 'Не выбрано',
  selectAll = false,
  error,
  disabled,
  required,
  clearable = true,
  onChange,
  onOpen,
  onClose,
  style,
  className,
}: VMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasError = Boolean(error);
  const hasValue = value.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const displayText = hasValue ? `Выбрано: ${value.length}` : emptyText || placeholder;

  const toggleOpen = () => {
    if (disabled) return;
    const next = !isOpen;
    setIsOpen(next);
    if (next) onOpen?.();
    else onClose?.();
  };

  const handleToggleOption = (optionValue: string) => {
    if (disabled) return;
    const next = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange?.(next);
  };

  const handleToggleAll = () => {
    if (disabled) return;
    const allSelected = value.length === options.length;
    onChange?.(allSelected ? [] : options.map((o) => o.value));
  };

  const allSelected = selectAll && value.length === options.length;

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange?.([]);
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      style={style}
    >
      {label && <label className={styles.label}>{label}</label>}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-invalid={hasError}
        aria-haspopup="listbox"
        onClick={toggleOpen}
        className={styles.trigger}
        data-has-value={hasValue ? 'true' : undefined}
        data-open={isOpen ? 'true' : undefined}
        data-invalid={hasError ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
      >
        <span className={styles.triggerText}>
          <span className={styles.triggerTextValue}>{displayText}</span>
        </span>
        <span className={styles.triggerActions}>
          {hasValue && clearable && !disabled && !required && (
            <button
              type="button"
              aria-label="Очистить"
              onClick={handleClear}
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
          {selectAll && (
            <>
              <Option
                option={{ value: '__select_all__', label: 'Выбрать все' }}
                isSelected={allSelected}
                onClick={handleToggleAll}
              />
              <div className={styles.separator} />
            </>
          )}
          {options.map((option) => (
            <Option
              key={option.value}
              option={option}
              isSelected={value.includes(option.value)}
              onClick={() => handleToggleOption(option.value)}
            />
          ))}
        </div>
      )}
      {hasError && <span className={styles.error}>{error}</span>}
    </div>
  );
};

interface OptionProps {
  option: VMultiSelectOption;
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
      <span className={styles.checkmark}>
        {isSelected && <CheckIcon size={14} color="currentColor" />}
      </span>
    </div>
  );
};
