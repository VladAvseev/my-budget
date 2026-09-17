import { VSkeletonCard } from '@/shared/ui/VSkeleton';
import styles from '../homeCard.module.css';

export const CardSkeleton = ({ delay, wide }: { delay?: string; wide?: boolean }) => (
  <VSkeletonCard
    delay={delay}
    className={`${styles.skeletonCard}${wide ? ` ${styles.skeletonWide}` : ''}`}
  />
);
