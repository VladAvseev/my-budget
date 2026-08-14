import type { ThemeName } from './useStyles';

const THEME_STORAGE_KEY = 'theme';

const THEME_NAMES: ThemeName[] = ['light', 'dark', 'midnight', 'cream'];

function isValidTheme(value: unknown): value is ThemeName {
  return THEME_NAMES.includes(value as ThemeName);
}

export function getStoredTheme(): ThemeName | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return isValidTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function setStoredTheme(theme: ThemeName): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage недоступен — сохранить выбранную тему не получится
  }
}
