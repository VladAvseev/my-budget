import type { CSSProperties, ReactNode } from 'react';
import { VCard } from '@/shared/ui/VCard';
import { VSkeleton } from './VSkeleton';
import styles from './VSkeleton.module.css';

export interface VSkeletonCardProps {

  lines?: number;

  title?: boolean;

  delay?: string;

  compact?: boolean;
  className?: string;
  style?: CSSProperties;

  children?: ReactNode;
}

export const VSkeletonCard = ({
  lines = 3,
  title = true,
  delay,
  compact,
  className,
  style,
  children,
}: VSkeletonCardProps) => (
  <VCard
    className={`${styles.card}${compact ? ` ${styles.cardCompact}` : ''}${className ? ` ${className}` : ''}`}
    style={{ animationDelay: delay, ...style }}
    aria-busy="true"
  >
    {title && <VSkeleton className={styles.cardTitle} />}
    {children}
    {Array.from({ length: lines }, (_, index) => (
      <VSkeleton key={index} className={index === lines - 1 ? styles.cardLineShort : undefined} />
    ))}
  </VCard>
);
