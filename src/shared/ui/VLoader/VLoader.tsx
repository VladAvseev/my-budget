import { useEffect, useState, type CSSProperties } from 'react';
import { LoaderIcon } from '@/shared/icons';
import { useThemeStyles } from '@/shared/theme';

export interface VLoaderProps {
  size?: number;
  color?: string;
  style?: CSSProperties;
}

export const VLoader = ({ size = 20, color, style }: VLoaderProps) => {
  const styles = useThemeStyles();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <span
      role="status"
      aria-label="Загрузка"
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}
    >
      <LoaderIcon
        size={size}
        color={color ?? styles.colors.textSecondary}
        style={{ animation: prefersReducedMotion ? 'none' : 'vloader-spin 1s linear infinite' }}
      />
    </span>
  );
};