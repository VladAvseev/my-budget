import { useTheme, useThemeStyles, type ThemeName } from '@/shared/theme';
import { darkStyles } from '@/shared/theme/packs/dark';
import { creamStyles } from '@/shared/theme/packs/cream';
import { lightStyles } from '@/shared/theme/packs/light';
import { midnightStyles } from '@/shared/theme/packs/midnight';
import { VCard } from '@/shared/ui/VCard';

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
  const styles = useThemeStyles();
  const { theme, setTheme } = useTheme();

  return (
    <VCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
        <div
          style={{
            fontSize: styles.typography.fontSize.xl,
            fontWeight: styles.typography.fontWeight.bold,
            color: styles.colors.textPrimary,
          }}
        >
          Тема
        </div>

        <div style={{ display: 'flex', gap: styles.spacing.xl, flexWrap: 'wrap' }}>
          {THEME_OPTIONS.map((option) => {
            const isSelected = theme === option.key;
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={isSelected}
                aria-label={`Тема «${option.label}»`}
                onClick={() => setTheme(option.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: styles.spacing.s,
                  width: 64,
                  padding: 0,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: styles.radius.round,
                    background: `linear-gradient(180deg, ${option.colors.bgSurface} 0 50%, transparent 50% 100%), linear-gradient(90deg, ${option.colors.accentLight} 0 50%, ${option.colors.accent} 50% 100%)`,
                    border: isSelected
                      ? `2px solid ${styles.colors.accent}`
                      : `1px solid ${option.colors.border}`,
                    boxShadow: isSelected ? styles.shadow.s : undefined,
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                />
                <span
                  style={{
                    fontSize: styles.typography.fontSize.s,
                    textAlign: 'center',
                    color: isSelected ? styles.colors.accent : styles.colors.textSecondary,
                  }}
                >
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
