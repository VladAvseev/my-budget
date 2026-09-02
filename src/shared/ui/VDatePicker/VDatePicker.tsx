import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClearIcon } from '@/shared/icons';
import { buildCalendarCells, formatDisplay, isSameDay, parseISO, toISODate } from '@/shared/utils';
import styles from './VDatePicker.module.css';

export interface VDatePickerProps {
  label?: string;
  error?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  style?: CSSProperties;
  className?: string;
  minDate?: string;
  maxDate?: string;
}

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const MONTH_LABELS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

export const VDatePicker = ({
  label,
  error,
  value,
  placeholder = 'Выберите дату',
  disabled,
  onChange,
  style,
  className,
  minDate,
  maxDate,
}: VDatePickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const hasError = Boolean(error);
  const hasValue = Boolean(value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleClear = (event: ReactMouseEvent) => {
    event.stopPropagation();
    onChange?.('');
  };

  const handleSelectDate = (day: Date) => {
    onChange?.(toISODate(day));
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`${styles.root}${className ? ` ${className}` : ''}`} style={style}>
      {label && <label className={styles.label}>{label}</label>}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-invalid={hasError}
        aria-haspopup="dialog"
        onClick={toggleOpen}
        className={styles.trigger}
        data-has-value={hasValue ? 'true' : undefined}
        data-open={isOpen ? 'true' : undefined}
        data-invalid={hasError ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
      >
        <span className={styles.triggerText}>
          {hasValue ? formatDisplay(value ?? '') : placeholder}
        </span>
        <span className={styles.triggerActions}>
          {hasValue && !disabled && (
            <button
              type="button"
              aria-label="Очистить"
              onClick={handleClear}
              className={styles.clearButton}
            >
              <ClearIcon size={16} color="currentColor" />
            </button>
          )}
          <span className={styles.calendarIcon}>
            <CalendarIcon size={16} color="currentColor" />
          </span>
        </span>
      </div>
      {isOpen && !disabled && <CalendarDropdown value={value} onSelect={handleSelectDate} minDate={minDate} maxDate={maxDate} />}
      {hasError && <span className={styles.error}>{error}</span>}
    </div>
  );
};

interface CalendarDropdownProps {
  value?: string;
  onSelect: (day: Date) => void;
  minDate?: string;
  maxDate?: string;
}

const CalendarDropdown = ({ value, onSelect, minDate, maxDate }: CalendarDropdownProps) => {
  const today = new Date();
  const selected = parseISO(value);

  const [viewDate, setViewDate] = useState<Date>(() => {
    const base = selected ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const cells = buildCalendarCells(viewYear, viewMonth);

  const goToPrevMonth = () => setViewDate(new Date(viewYear, viewMonth - 1, 1));
  const goToNextMonth = () => setViewDate(new Date(viewYear, viewMonth + 1, 1));
  const goToToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  return (
    <div role="dialog" aria-label="Календарь" className={styles.dropdown}>
      <div className={styles.navRow}>
        <CalendarNavButton onClick={goToPrevMonth} ariaLabel="Предыдущий месяц">
          <ChevronLeftIcon size={16} color="currentColor" />
        </CalendarNavButton>
        <button type="button" onClick={goToToday} className={styles.monthButton}>
          {MONTH_LABELS[viewMonth]} {viewYear}
        </button>
        <CalendarNavButton onClick={goToNextMonth} ariaLabel="Следующий месяц">
          <ChevronRightIcon size={16} color="currentColor" />
        </CalendarNavButton>
      </div>

      <div className={styles.calendarGrid}>
        {WEEKDAY_LABELS.map((weekday) => (
          <div key={weekday} className={styles.weekday}>
            {weekday}
          </div>
        ))}
      </div>

      <div className={styles.calendarGrid}>
        {cells.map((day) => {
          const inCurrentMonth = day.getMonth() === viewMonth;
          const isSelected = isSameDay(day, selected);
          const isToday = isSameDay(day, today);
          const dayISO = toISODate(day);
          const isDisabled = (minDate && dayISO < minDate) || (maxDate && dayISO > maxDate);

          return (
            <DayCell
              key={dayISO}
              day={day}
              inCurrentMonth={inCurrentMonth}
              isSelected={isSelected}
              isToday={isToday}
              disabled={isDisabled ? true : undefined}
              onClick={() => {
                if (!isDisabled) {
                  onSelect(day);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

interface DayCellProps {
  day: Date;
  inCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const DayCell = ({ day, inCurrentMonth, isSelected, isToday, disabled, onClick }: DayCellProps) => {
  const className = [
    styles.day,
    isSelected ? styles.daySelected : '',
    isToday ? styles.dayToday : '',
    !inCurrentMonth ? styles.dayOutOfMonth : '',
    disabled ? styles.dayDisabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      aria-selected={isSelected}
      aria-current={isToday ? 'date' : undefined}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {day.getDate()}
    </button>
  );
};

interface CalendarNavButtonProps {
  children: ReactNode;
  onClick: () => void;
  ariaLabel: string;
}

const CalendarNavButton = ({ children, onClick, ariaLabel }: CalendarNavButtonProps) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={styles.navButton}
    >
      {children}
    </button>
  );
};