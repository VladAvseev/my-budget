import type { Operation } from '@/shared/supabase/types/domain';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount, formatDisplay } from '@/shared/utils';
import { useSetAtom } from 'jotai';
import { operationModalAtom } from '../../atoms/report';
import styles from './operationCard.module.css';

interface DailyOperationCardProps {
  operation: Operation;
  dailyBudget: number | null;
  pending?: boolean;
}

export const DailyOperationCard = ({
  operation,
  dailyBudget,
  pending = false,
}: DailyOperationCardProps) => {
  const setModal = useSetAtom(operationModalAtom);

  const amount = Number(operation.amount) || 0;
  const deviation = dailyBudget != null ? amount - dailyBudget : null;
  const deviationColor =
    deviation != null ? (deviation > 0 ? 'var(--color-error)' : 'var(--color-success)') : undefined;

  const handleOpen = () => {
    if (!pending) {
      setModal({ type: 'daily', operation });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!pending && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      setModal({ type: 'daily', operation });
    }
  };

  return (
    <VCard
      role="button"
      tabIndex={pending ? -1 : 0}
      aria-disabled={pending}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className={`${styles.card}${pending ? ` ${styles.cardPending}` : ''}`}
    >
      <div className={styles.row}>
        <div className={styles.left}>
          <div className={styles.amount}>
            {formatAmount(amount)}
          </div>
          {operation.description && (
            <div className={styles.subtitle}>{operation.description}</div>
          )}
        </div>
        <div className={styles.right}>
          {deviation != null && (
            <div className={styles.deviation} style={{ color: deviationColor }}>
              {formatAmount(Math.abs(deviation))}
            </div>
          )}
          <div className={styles.date}>{formatDisplay(operation.date ?? '')}</div>
        </div>
      </div>
      {pending && <VLoader size={16} />}
    </VCard>
  );
};