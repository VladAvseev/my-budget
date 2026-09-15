import { VSkeletonCard } from '@/shared/ui/VSkeleton';
import styles from '../homeCard.module.css';

/**
 * Скелетон карточки главной: те же габариты, что у обычных карточек, —
 * при приходе данных карточки не «прыгают».
 * Флаг wide — под hero-карточки на всю ширину ряда.
 */
export const CardSkeleton = ({ delay, wide }: { delay?: string; wide?: boolean }) => (
  <VSkeletonCard
    delay={delay}
    className={`${styles.skeletonCard}${wide ? ` ${styles.skeletonWide}` : ''}`}
  />
);
