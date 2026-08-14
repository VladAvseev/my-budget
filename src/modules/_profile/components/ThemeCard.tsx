import { useTheme, type ThemeName } from '@/shared/theme';
import { darkStyles } from '@/shared/theme/packs/dark';
import { creamStyles } from '@/shared/theme/packs/cream';
import { lightStyles } from '@/shared/theme/packs/light';
import { midnightStyles } from '@/shared/theme/packs/midnight';
import { VCard } from '@/shared/ui/VCard';
import styles from './ThemeCard.module.css';

type ThemeColors = (typeof lightStyles)['colors'];

interface ThemeOption {
  key: ThemeName;
  label: string;
  colors: ThemeColors;
}

const THEME_OPTIONS: ThemeOption[] = [
  { key: 'light', label: 'Светлая', colors: lightStyles.colors },
  { key: 'dark', label: 'Тёмная', colors: darkStyles.colors },
  { key: 'midnight', label: 'Полуночная', colors: midnightStyles.colors },
  { key: 'cream', label: 'Кремовая', colors: creamStyles.colors },
];

export const ThemeCard = () => {
  const { theme, setTheme } = useTheme();

  return (
    <VCard>
      <div className={styles.body}>
        <div className={styles.title}>Тема</div>

        <div className={styles.options}>
          {THEME_OPTIONS.map((option) => {
            const isSelected = theme === option.key;
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={isSelected}
                aria-label={`Тема «${option.label}»`}
                onClick={() => setTheme(option.key)}
                className={styles.option}
              >
                <span
                  className={styles.preview}
                  style={{
                    background: `linear-gradient(180deg, ${option.colors.bgSurface} 0 50%, transparent 50% 100%), linear-gradient(90deg, ${option.colors.accentLight} 0 50%, ${option.colors.accent} 50% 100%)`,
                    border: isSelected
                      ? '2px solid var(--color-accent)'
                      : `1px solid ${option.colors.border}`,
                    boxShadow: isSelected ? 'var(--shadow-s)' : undefined,
                  }}
                />
                <span className={styles.label} data-selected={String(isSelected)}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </VCard>
  );
};