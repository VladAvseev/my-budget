import type { ThemeName } from '@/shared/theme/types';

const THEME_STORAGE_KEY = 'theme';

const THEME_NAMES: ThemeName[] = ['dark', 'light'];

function isValidTheme(value: unknown): value is ThemeName {
  return THEME_NAMES.includes(value as ThemeName);
}

export function getStoredTheme(): ThemeName {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (isValidTheme(value)) return value;
    setStoredTheme('dark');
    return 'dark';
  } catch {
    return 'dark';
  }
}

export function setStoredTheme(theme: ThemeName): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage недоступен — сохранить выбранную тему не получится
  }
}
