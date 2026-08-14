import { ChevronDownIcon, ClearIcon } from '@/shared/icons';
import { useThemeStyles } from '@/shared/theme';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

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
  onChange?: (value: string) => void;
  style?: CSSProperties;
}

export const VSelect = ({
  label,
  options,
  value = '',
  placeholder,
  error,
  disabled,
  onChange,
  style,
}: VSelectProps) => {
  const styles = useThemeStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasError = Boolean(error);
  const hasValue = value !== '';

  const borderColor = hasError
    ? styles.colors.error
    : isOpen
      ? styles.colors.accent
      : isHovered
        ? styles.colors.textSecondary
        : styles.colors.border;

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
    <div
      ref={containerRef}
      style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.xs, ...style }}
    >
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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: styles.spacing.s,
          borderRadius: styles.radius.m,
          fontSize: styles.typography.fontSize.m,
          backgroundColor: disabled ? 'transparent' : styles.colors.bgSurface,
          color: hasValue ? styles.colors.textPrimary : styles.colors.textSecondary,
          border: `1px solid ${borderColor}`,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          userSelect: 'none',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: styles.spacing.s,
            overflow: 'hidden',
          }}
        >
          {selectedOption?.prefix}
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayText}
          </span>
        </span>
        <span
          style={{ display: 'flex', alignItems: 'center', gap: styles.spacing.s, flexShrink: 0 }}
        >
          {hasValue && !disabled && (
            <button
              type="button"
              aria-label="Очистить"
              onClick={(event) => {
                event.stopPropagation();
                handleSelect('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <ClearIcon size={16} color={styles.colors.textSecondary} />
            </button>
          )}
          <ChevronDownIcon
            size={16}
            color={styles.colors.textSecondary}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease',
            }}
          />
        </span>
      </div>
      {isOpen && !disabled && (
        <div
          role="listbox"
          style={{
            backgroundColor: styles.colors.bgSurface,
            borderRadius: styles.radius.m,
            boxShadow: styles.shadow.l,
            maxHeight: '240px',
            overflowY: 'auto',
            zIndex: 10,
          }}
        >
          {options.map((option) => (
            <Option
              key={option.value}
              option={option}
              isSelected={option.value === value}
              styles={styles}
              onClick={() => handleSelect(option.value)}
            />
          ))}
        </div>
      )}
      {hasError && (
        <span style={{ fontSize: styles.typography.fontSize.s, color: styles.colors.error }}>
          {error}
        </span>
      )}
    </div>
  );
};

interface OptionProps {
  option: VSelectOption;
  isSelected: boolean;
  styles: ReturnType<typeof useThemeStyles>;
  onClick: () => void;
}

const Option = ({ option, isSelected, styles, onClick }: OptionProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: styles.spacing.s,
        padding: `${styles.spacing.s} ${styles.spacing.m}`,
        fontSize: styles.typography.fontSize.m,
        color: isSelected || isHovered ? styles.colors.accent : styles.colors.textPrimary,
        backgroundColor: isHovered ? styles.colors.accentLight : 'transparent',
        cursor: 'pointer',
      }}
    >
      {option.prefix}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {option.label}
      </span>
    </div>
  );
};
