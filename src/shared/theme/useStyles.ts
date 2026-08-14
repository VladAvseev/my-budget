import { useMemo } from 'react';
import { commonStyles } from './common';

export type ThemeName = 'light' | 'dark' | 'midnight' | 'cream';

const themeColorVariables = {
  bgPrimary: 'var(--color-bg-primary)',
  bgSurface: 'var(--color-bg-surface)',
  bgSurfaceHover: 'var(--color-bg-surface-hover)',
  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  border: 'var(--color-border)',
  accent: 'var(--color-accent)',
  accentHover: 'var(--color-accent-hover)',
  accentLight: 'var(--color-accent-light)',
  accentAlpha: 'var(--color-accent-alpha)',
  success: 'var(--color-success)',
  successBg: 'var(--color-success-bg)',
  successBorder: 'var(--color-success-border)',
  warning: 'var(--color-warning)',
  warningBg: 'var(--color-warning-bg)',
  warningBorder: 'var(--color-warning-border)',
  error: 'var(--color-error)',
  errorHover: 'var(--color-error-hover)',
  errorBg: 'var(--color-error-bg)',
  errorBorder: 'var(--color-error-border)',
} as const;

export function useStyles() {
  return useMemo(
    () => ({
      ...commonStyles,
      colors: themeColorVariables,
    }),
    [],
  );
}
