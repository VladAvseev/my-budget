import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClearIcon } from '@/shared/icons';
import { useThemeStyles } from '@/shared/theme';
import { buildCalendarCells, formatDisplay, isSameDay, parseISO, toISODate } from '@/shared/utils';

export interface VDatePickerProps {
  label?: string;
  error?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  style?: CSSProperties;
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

const DAY_CELL_SIZE = 36;
const WEEKDAY_HEIGHT = 28;
const NAV_BUTTON_SIZE = 28;

export const VDatePicker = ({
  label,
  error,
  value,
  placeholder = 'Выберите дату',
  disabled,
  onChange,
  style,
}: VDatePickerProps) => {
  const styles = useThemeStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasError = Boolean(error);
  const hasValue = Boolean(value);

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
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: styles.spacing.xs,
        ...style,
      }}
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
        aria-haspopup="dialog"
        onClick={toggleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: styles.spacing.s,
          padding: styles.spacing.s,
          borderRadius: styles.radius.m,
          fontSize: styles.typography.fontSize.m,
          backgroundColor: disabled ? 'transparent' : styles.colors.bgSurface,
          color: hasValue ? styles.colors.textPrimary : styles.colors.textSecondary,
          border: `1px solid ${borderColor}`,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          userSelect: 'none',
          transition: 'border-color 0.15s ease',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {hasValue ? formatDisplay(value ?? '') : placeholder}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: styles.spacing.s, flexShrink: 0 }}>
          {hasValue && !disabled && (
            <button
              type="button"
              aria-label="Очистить"
              onClick={handleClear}
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
          <CalendarIcon size={16} color={styles.colors.textSecondary} />
        </span>
      </div>
      {isOpen && !disabled && (
        <CalendarDropdown
          value={value}
          onSelect={handleSelectDate}
        />
      )}
      {hasError && (
        <span style={{ fontSize: styles.typography.fontSize.s, color: styles.colors.error }}>
          {error}
        </span>
      )}
    </div>
  );
};

interface CalendarDropdownProps {
  value?: string;
  onSelect: (day: Date) => void;
}

const CalendarDropdown = ({ value, onSelect }: CalendarDropdownProps) => {
  const styles = useThemeStyles();
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
    <div
      role="dialog"
      aria-label="Календарь"
      style={{
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: styles.spacing.s,
        padding: styles.spacing.m,
        backgroundColor: styles.colors.bgSurface,
        borderRadius: styles.radius.l,
        boxShadow: styles.shadow.l,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: styles.spacing.s,
        }}
      >
        <CalendarNavButton onClick={goToPrevMonth} ariaLabel="Предыдущий месяц">
          <ChevronLeftIcon size={16} color={styles.colors.textPrimary} />
        </CalendarNavButton>
        <button
          type="button"
          onClick={goToToday}
          style={{
            padding: 0,
            border: 'none',
            background: 'transparent',
            fontSize: styles.typography.fontSize.m,
            fontWeight: styles.typography.fontWeight.medium,
            color: styles.colors.textPrimary,
            cursor: 'pointer',
          }}
        >
          {MONTH_LABELS[viewMonth]} {viewYear}
        </button>
        <CalendarNavButton onClick={goToNextMonth} ariaLabel="Следующий месяц">
          <ChevronRightIcon size={16} color={styles.colors.textPrimary} />
        </CalendarNavButton>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: styles.spacing.xs,
        }}
      >
        {WEEKDAY_LABELS.map((weekday) => (
          <div
            key={weekday}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: DAY_CELL_SIZE,
              height: WEEKDAY_HEIGHT,
              fontSize: styles.typography.fontSize.s,
              fontWeight: styles.typography.fontWeight.medium,
              color: styles.colors.textSecondary,
            }}
          >
            {weekday}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: styles.spacing.xs,
        }}
      >
        {cells.map((day) => {
          const inCurrentMonth = day.getMonth() === viewMonth;
          const isSelected = isSameDay(day, selected);
          const isToday = isSameDay(day, today);

          return (
            <DayCell
              key={toISODate(day)}
              day={day}
              inCurrentMonth={inCurrentMonth}
              isSelected={isSelected}
              isToday={isToday}
              onClick={() => onSelect(day)}
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
  onClick: () => void;
}

const DayCell = ({ day, inCurrentMonth, isSelected, isToday, onClick }: DayCellProps) => {
  const styles = useThemeStyles();
  const [isHovered, setIsHovered] = useState(false);

  const backgroundColor = isSelected
    ? styles.colors.accent
    : isHovered
      ? styles.colors.accentLight
      : 'transparent';

  const color = isSelected
    ? styles.colors.bgPrimary
    : isHovered || isToday
      ? styles.colors.accent
      : inCurrentMonth
        ? styles.colors.textPrimary
        : styles.colors.textSecondary;

  return (
    <button
      type="button"
      aria-selected={isSelected}
      aria-current={isToday ? 'date' : undefined}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: DAY_CELL_SIZE,
        height: DAY_CELL_SIZE,
        padding: 0,
        borderRadius: styles.radius.s,
        fontSize: styles.typography.fontSize.m,
        fontWeight: isToday || isSelected ? styles.typography.fontWeight.medium : styles.typography.fontWeight.regular,
        color,
        backgroundColor,
        border: isToday ? `1px solid ${styles.colors.accent}` : 'none',
        cursor: 'pointer',
        opacity: inCurrentMonth ? 1 : 0.5,
      }}
    >
      {day.getDate()}
    </button>
  );
};

interface CalendarNavButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
}

const CalendarNavButton = ({ children, onClick, ariaLabel }: CalendarNavButtonProps) => {
  const styles = useThemeStyles();

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: NAV_BUTTON_SIZE,
        height: NAV_BUTTON_SIZE,
        padding: 0,
        border: 'none',
        borderRadius: styles.radius.s,
        background: 'transparent',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
};