import { VSkeletonCard } from '@/shared/ui/VSkeleton';
import styles from '../homeCard.module.css';

/**
 * Скелетон карточки главной: те же габариты, что у обычных карточек, —
 * при приходе данных карточки не «прыгают».
 */
export const CardSkeleton = ({ delay }: { delay?: string }) => (
  <VSkeletonCard delay={delay} className={styles.skeletonCard} />
);
