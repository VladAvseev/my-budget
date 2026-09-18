import { ChevronDownIcon, ClearIcon } from '@/shared/icons';
import { VCircularLoader } from '@/shared/ui/VLoader';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
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
  emptyText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  onChange?: (value: string) => void;
  style?: CSSProperties;
  className?: string;
}

export const VSelect = ({
  label,
  options,
  value = '',
  emptyText = 'Не выбрано',
  error,
  disabled,
  required,
  loading,
  onChange,
  style,
  className,
}: VSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

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

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const selected = dropdownRef.current.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen]);

  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption ? selectedOption.label : emptyText;

  const handleSelect = (optionValue: string) => {
    setIsOpen(false);
    onChange?.(optionValue);
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent) => {
    if (disabled) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      style={style}
    >
      {label && (
        <label id={labelId} className={styles.label}>
          {label}
        </label>
      )}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-invalid={hasError}
        aria-busy={loading ? 'true' : undefined}
        aria-haspopup="listbox"
        aria-labelledby={label ? labelId : undefined}
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        className={styles.trigger}
        data-has-value={hasValue ? 'true' : undefined}
        data-open={isOpen ? 'true' : undefined}
        data-invalid={hasError ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        data-loading={loading ? 'true' : undefined}
      >
        <span className={styles.triggerText}>
          {selectedOption?.prefix}
          <span className={styles.triggerTextValue}>{displayText}</span>
        </span>
        <span className={styles.triggerActions}>
          {hasValue && !disabled && !required && !loading && (
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
          {loading ? (
            <span className={styles.loader} role="status" aria-label="Загрузка">
              <VCircularLoader size={16} />
            </span>
          ) : (
            <span className={styles.chevron}>
              <ChevronDownIcon size={16} color="currentColor" />
            </span>
          )}
        </span>
      </div>
      {isOpen && !disabled && (
        <div ref={dropdownRef} role="listbox" className={styles.dropdown}>
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
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      className={styles.option}
      data-selected={isSelected ? 'true' : undefined}
    >
      {option.prefix}
      <span className={styles.optionText}>{option.label}</span>
    </div>
  );
};
