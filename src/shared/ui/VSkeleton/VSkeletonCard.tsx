import type { CSSProperties, ReactNode } from 'react';
import { VCard } from '@/shared/ui/VCard';
import { VSkeleton } from './VSkeleton';
import styles from './VSkeleton.module.css';

export interface VSkeletonCardProps {
  /** Количество строк текста под заголовком. */
  lines?: number;
  /** Показывать строку-заголовок. */
  title?: boolean;
  /** Задержка появления (animationDelay), как у реальных карточек. */
  delay?: string;
  /** Компактный внутренний отступ (VCard padding) вместо увеличенного. */
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Дополнительное содержимое-заглушка (например, круг-аватар) над строками. */
  children?: ReactNode;
}

/**
 * Скелетон карточки: пульсирующие строки-заглушки.
 * Габариты подстраиваются через className, чтобы при приходе данных контент не «прыгал».
 */
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
