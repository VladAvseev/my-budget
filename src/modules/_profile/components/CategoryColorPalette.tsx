import { COLOR_PALETTE, COLOR_PALETTE_BG_ALPHA, withAlpha } from '@/shared/colors';
import { useThemeStyles } from '@/shared/theme';

interface CategoryColorPaletteProps {
  value?: string;
  onChange?: (color: string) => void;
  disabled?: boolean;
}

export const CategoryColorPalette = ({
  value = '',
  onChange,
  disabled,
}: CategoryColorPaletteProps) => {
  const styles = useThemeStyles();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.s }}>
      <div
        style={{
          fontSize: styles.typography.fontSize.s,
          fontWeight: styles.typography.fontWeight.medium,
          color: styles.colors.textSecondary,
        }}
      >
        Цвет
      </div>
      <div style={{ containerType: 'inline-size' }}>
        <div
          className="color-palette-circles"
          style={{
            display: 'grid',
            gap: styles.spacing.s,
          }}
        >
          {COLOR_PALETTE.map((color) => {
            const isSelected = color === value;
            return (
              <button
                key={color}
                type="button"
                aria-label={color}
                disabled={disabled}
                onClick={() => onChange?.(isSelected ? '' : color)}
                style={{
                  width: 28,
                  height: 28,
                  padding: 0,
                  borderRadius: styles.radius.round,
                  backgroundColor: withAlpha(color, COLOR_PALETTE_BG_ALPHA),
                  border: `2px solid ${color}`,
                  boxShadow: isSelected ? `0 0 0 2px ${styles.colors.textPrimary}` : 'none',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                }}
              />
            );
          })}
        </div>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange?.('')}
        style={{
          alignSelf: 'flex-start',
          padding: 0,
          border: 'none',
          background: 'transparent',
          color: value === '' ? styles.colors.textPrimary : styles.colors.textSecondary,
          fontSize: styles.typography.fontSize.s,
          fontWeight:
            value === ''
              ? styles.typography.fontWeight.medium
              : styles.typography.fontWeight.regular,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        Без цвета
      </button>
    </div>
  );
};