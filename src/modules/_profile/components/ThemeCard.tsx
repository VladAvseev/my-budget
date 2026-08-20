import { useTheme, type ThemeName } from '@/shared/theme';
import { VCard } from '@/shared/ui/VCard';
import styles from './ThemeCard.module.css';

interface ThemeColors {
  bgSurface: string;
  accent: string;
  accentLight: string;
  border: string;
}

interface ThemeOption {
  key: ThemeName;
  label: string;
  colors: ThemeColors;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    key: 'dark',
    label: 'Тёмно-синяя',
    colors: {
      bgSurface: '#34343f',
      accent: '#0099dc',
      accentLight: '#8fd8f8',
      border: '#41414e',
    },
  },
  {
    key: 'orange',
    label: 'Тёмно-оранжевая',
    colors: {
      bgSurface: '#3b4148',
      accent: '#fd7a22',
      accentLight: '#fbd3bc',
      border: '#4c535b',
    },
  },
  {
    key: 'light',
    label: 'Светло-зелёная',
    colors: {
      bgSurface: '#f7f9f7',
      accent: '#21a038',
      accentLight: '#dff3e2',
      border: '#cfd6d0',
    },
  },
  {
    key: 'cream',
    label: 'Светло-кремовая',
    colors: {
      bgSurface: '#fbf7ef',
      accent: '#c2693f',
      accentLight: '#f3dcc7',
      border: '#ded4c2',
    },
  },
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