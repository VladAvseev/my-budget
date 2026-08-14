import { withAlpha } from '@/shared/colors';
import { useStyles, type ThemeName } from './useStyles';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getStoredTheme, setStoredTheme } from './storage';

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const DEFAULT_THEME: ThemeName = 'dark';

const SCROLLBAR_THUMB_ALPHA = 0.4;
const SCROLLBAR_THUMB_HOVER_ALPHA = 0.6;

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => getStoredTheme() ?? DEFAULT_THEME);
  const styles = useStyles(theme);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      '--app-scrollbar-thumb',
      withAlpha(styles.colors.textSecondary, SCROLLBAR_THUMB_ALPHA),
    );
    root.style.setProperty(
      '--app-scrollbar-thumb-hover',
      withAlpha(styles.colors.textSecondary, SCROLLBAR_THUMB_HOVER_ALPHA),
    );
  }, [styles.colors.textSecondary]);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    setStoredTheme(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme должен использоваться внутри ThemeProvider');
  }
  return ctx;
}

export function useThemeStyles() {
  const { theme } = useTheme();
  return useStyles(theme);
}
