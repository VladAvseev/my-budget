import { useThemeStyles } from '@/shared/theme';

interface VCategoryDotProps {
  color: string;
}

export const VCategoryDot = ({ color }: VCategoryDotProps) => {
  const styles = useThemeStyles();

  return (
    <span
      style={{
        width: 16,
        height: 16,
        flexShrink: 0,
        borderRadius: styles.radius.round,
        backgroundColor: color,
        border: `1px solid ${color}`,
      }}
    />
  );
};