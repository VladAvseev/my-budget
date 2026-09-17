import type { CSSProperties } from 'react';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { getErrorMessage } from '@/shared/utils';
import commonStyles from '@/shared/styles/common.module.css';
import styles from './VErrorCard.module.css';

export interface VErrorCardProps {

  title: string;

  error?: unknown;

  onRetry?: () => void;

  isRetrying?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const VErrorCard = ({
  title,
  error,
  onRetry,
  isRetrying,
  className,
  style,
}: VErrorCardProps) => (
  <VCard className={`${styles.card}${className ? ` ${className}` : ''}`} style={style}>
    <div className={commonStyles.emptyTitle}>{title}</div>
    {error != null && <div className={commonStyles.emptyHint}>{getErrorMessage(error)}</div>}
    {onRetry && (
      <VButton onClick={() => void onRetry()} isLoading={isRetrying}>
        Повторить
      </VButton>
    )}
  </VCard>
);
