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

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => getStoredTheme() ?? DEFAULT_THEME);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
  return useStyles();
}
