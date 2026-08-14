import styles from './VCategoryDot.module.css';

interface VCategoryDotProps {
  color: string;
  className?: string;
}

export const VCategoryDot = ({ color, className }: VCategoryDotProps) => {
  return (
    <span
      className={`${styles.dot}${className ? ` ${className}` : ''}`}
      style={{ backgroundColor: color, border: `1px solid ${color}` }}
    />
  );
};