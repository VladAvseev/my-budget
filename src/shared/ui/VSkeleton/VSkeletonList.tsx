import type { CSSProperties, ReactNode } from 'react';
import { VSkeletonCard, type VSkeletonCardProps } from './VSkeletonCard';
import styles from './VSkeleton.module.css';

export interface VSkeletonListProps {
  count?: number;

  stagger?: number;

  renderItem?: (index: number) => ReactNode;

  cardProps?: Omit<VSkeletonCardProps, 'delay'>;
  className?: string;
  style?: CSSProperties;
}

export const VSkeletonList = ({
  count = 3,
  stagger = 0.05,
  renderItem,
  cardProps,
  className,
  style,
}: VSkeletonListProps) => (
  <div
    className={`${styles.list}${className ? ` ${className}` : ''}`}
    style={style}
    role="status"
    aria-label="Загрузка"
    aria-busy="true"
  >
    {Array.from({ length: count }, (_, index) =>
      renderItem ? (
        <div key={index}>{renderItem(index)}</div>
      ) : (
        <VSkeletonCard key={index} delay={`${index * stagger}s`} {...cardProps} />
      ),
    )}
  </div>
);
