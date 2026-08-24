import type { Category } from '@/shared/supabase/types/domain';
import { VBadge } from '@/shared/ui/VBadge';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount, formatDisplay } from '@/shared/utils';
import styles from './operationCard.module.css';

interface OperationCardBaseProps {
  amount: number;
  amountColor: string;
  description?: string | null;
  category?: Category | null;
  date?: string | null;
  pending?: boolean;
  onOpen: () => void;
}

export const OperationCardBase = ({
  amount,
  amountColor,
  description,
  category,
  date,
  pending = false,
  onOpen,
}: OperationCardBaseProps) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!pending && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <VCard
      role="button"
      tabIndex={pending ? -1 : 0}
      aria-disabled={pending}
      onClick={() => {
        if (!pending) {
          onOpen();
        }
      }}
      onKeyDown={handleKeyDown}
      className={`${styles.card}${pending ? ` ${styles.cardPending}` : ''}`}
    >
      <div className={styles.left}>
        <div className={styles.amount} style={{ color: amountColor }}>
          {formatAmount(amount)}
        </div>
        {description && <div className={styles.subtitle}>{description}</div>}
      </div>
      <div className={styles.right}>
        {pending ? (
          <VLoader size={16} />
        ) : category?.name ? (
          <VBadge color={category?.color ?? undefined} className={styles.badge}>
            {category?.name}
          </VBadge>
        ) : null}
        {date && <div className={styles.date}>{formatDisplay(date)}</div>}
      </div>
    </VCard>
  );
};