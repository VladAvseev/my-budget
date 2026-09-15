import { VSkeletonCard } from '@/shared/ui/VSkeleton';
import styles from '../homeCard.module.css';

/**
 * Скелетон карточки главной: резервирует место под сводку.
 * Флаг wide выделяет крупную сводку внутри адаптивной сетки.
 */
export const CardSkeleton = ({ delay, wide }: { delay?: string; wide?: boolean }) => (
  <VSkeletonCard
    delay={delay}
    className={`${styles.skeletonCard}${wide ? ` ${styles.skeletonWide}` : ''}`}
  />
);
