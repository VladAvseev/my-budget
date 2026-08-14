import { COLOR_PALETTE, COLOR_PALETTE_BG_ALPHA, withAlpha } from '@/shared/colors';
import styles from './CategoryColorPalette.module.css';

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
  return (
    <div className={styles.root}>
      <div className={styles.label}>Цвет</div>
      <div className={styles.container}>
        <div className={styles.circles}>
          {COLOR_PALETTE.map((color) => {
            const isSelected = color === value;
            return (
              <button
                key={color}
                type="button"
                aria-label={color}
                disabled={disabled}
                onClick={() => onChange?.(isSelected ? '' : color)}
                className={styles.circle}
                style={{
                  backgroundColor: withAlpha(color, COLOR_PALETTE_BG_ALPHA),
                  border: `2px solid ${color}`,
                  boxShadow: isSelected ? '0 0 0 2px var(--color-text-primary)' : 'none',
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
        className={styles.clearButton}
        data-active={value === '' ? 'true' : undefined}
      >
        Без цвета
      </button>
    </div>
  );
};