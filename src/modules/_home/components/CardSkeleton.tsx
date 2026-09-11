import { VCard } from '@/shared/ui/VCard';
import styles from '../homeCard.module.css';

/**
 * Скелетон карточки главной: те же габариты, что у loadingCard, —
 * при приходе данных карточки не «прыгают».
 */
export const CardSkeleton = ({ delay }: { delay?: string }) => (
  <VCard
    className={`${styles.skeletonCard} ${styles.animateCard}`}
    style={delay ? { animationDelay: delay } : undefined}
    aria-busy="true"
  >
    <span className={`${styles.skeletonLine} ${styles.skeletonLineTitle}`} />
    <span className={styles.skeletonLine} />
    <span className={styles.skeletonLine} />
    <span className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
  </VCard>
);
