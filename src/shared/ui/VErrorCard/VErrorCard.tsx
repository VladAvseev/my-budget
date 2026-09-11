import type { CSSProperties } from 'react';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { getErrorMessage } from '@/shared/utils';
import commonStyles from '@/shared/styles/common.module.css';
import styles from './VErrorCard.module.css';

export interface VErrorCardProps {
  /** Заголовок: «Не удалось загрузить …». */
  title: string;
  /** Ошибка запроса — её текст показывается подзаголовком. */
  error?: unknown;
  /** Обработчик повтора; если не передан — кнопка не рендерится. */
  onRetry?: () => void;
  /** Идёт ли сейчас повтор (спиннер в кнопке). */
  isRetrying?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Карточка ошибки загрузки с рекомендацией попробовать ещё раз (как на главной). */
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
