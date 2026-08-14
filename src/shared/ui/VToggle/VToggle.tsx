import { useThemeStyles } from '@/shared/theme';
import { useState, type CSSProperties, type ReactNode } from 'react';

const TRACK_WIDTH = 36;
const TRACK_HEIGHT = 20;
const HANDLE_SIZE = 14;
const KNOB_GAP = 3;

const handleLeft = (checked: boolean) =>
  checked ? TRACK_WIDTH - HANDLE_SIZE - KNOB_GAP : KNOB_GAP;
const handleTop = (TRACK_HEIGHT - HANDLE_SIZE) / 2;

export interface VToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  style?: CSSProperties;
}

export const VToggle = ({
  checked,
  defaultChecked,
  onChange,
  disabled,
  label,
  style,
}: VToggleProps) => {
  const styles = useThemeStyles();
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  const [isHovered, setIsHovered] = useState(false);

  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const trackBackground = isChecked
    ? isHovered
      ? styles.colors.accentHover
      : styles.colors.accent
    : isHovered
      ? styles.colors.textSecondary
      : styles.colors.border;

  const handleColor = isChecked ? styles.colors.bgPrimary : styles.colors.bgSurface;

  const handleToggle = () => {
    if (disabled) {
      return;
    }
    const next = !isChecked;
    if (!isControlled) {
      setInternalChecked(next);
    }
    onChange?.(next);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: styles.spacing.m, ...style }}>
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          flexShrink: 0,
          padding: 0,
          border: 'none',
          borderRadius: styles.radius.m,
          backgroundColor: trackBackground,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'background-color 0.15s ease',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: handleTop,
            left: handleLeft(isChecked),
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            borderRadius: styles.radius.round,
            backgroundColor: handleColor,
            boxShadow: styles.shadow.s,
            transition: 'left 0.15s ease, background-color 0.15s ease',
          }}
        />
      </button>
      {label && (
        <span style={{ fontSize: styles.typography.fontSize.m, color: styles.colors.textPrimary }}>
          {label}
        </span>
      )}
    </div>
  );
};
