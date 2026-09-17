export { getStoredTheme, setStoredTheme } from '@/shared/theme/storage';
export { ThemeProvider, useTheme } from '@/shared/theme/ThemeContext';
export type {
  ThemeName,
  M3EThemeMode,
  M3EMotionSpec,
  M3EShapeScale,
  M3EColorRole,
  M3EColorScheme,
} from '@/shared/theme/types';
export {
  expressiveMotion,
  sampleSpring,
  animateSpring,
  type SpringSpec,
  type SpringSample,
  type SpringState,
  type AnimateSpringOptions,
  type SpringAnimationControl,
} from '@/shared/theme/m3e-spring-runtime';
