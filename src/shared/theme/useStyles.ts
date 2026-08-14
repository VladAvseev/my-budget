import { useMemo } from 'react';
import { commonStyles } from './common';
import { darkStyles } from './packs/dark';
import { creamStyles } from './packs/cream';
import { lightStyles } from './packs/light';
import { midnightStyles } from './packs/midnight';

export type ThemeName = 'light' | 'dark' | 'midnight' | 'cream';

function getThemeStyles(theme: ThemeName) {
  switch (theme) {
    case 'dark':
      return darkStyles;
    case 'midnight':
      return midnightStyles;
    case 'cream':
      return creamStyles;
    default:
      return lightStyles;
  }
}

export function useStyles(theme: ThemeName) {
  const themeStyles = getThemeStyles(theme);

  return useMemo(
    () => ({
      ...commonStyles,
      colors: themeStyles.colors,
    }),
    [themeStyles.colors],
  );
}
