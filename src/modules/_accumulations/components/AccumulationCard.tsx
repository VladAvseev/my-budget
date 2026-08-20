import type { Category } from '@/shared/supabase/types/domain';
import type { Accumulation } from '@/shared/supabase/types/domain';
import { VCategoryDot } from '@/shared/ui/VCategoryDot';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount } from '@/shared/utils';
import { useSetAtom } from 'jotai';
import { accumulationModalAtom } from '../atoms/accumulations';
import styles from './AccumulationCard.module.css';

interface AccumulationCardProps {
  accumulation: Accumulation;
  category: Category | null;
  pending?: boolean;
}

export const AccumulationCard = ({
  accumulation,
  category,
  pending = false,
}: AccumulationCardProps) => {
  const setModal = useSetAtom(accumulationModalAtom);

  const handleOpen = () => {
    if (!pending) {
      setModal({ accumulation });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!pending && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      setModal({ accumulation });
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
      <div className={styles.left}>
        {category?.color ? (
          <VCategoryDot color={category.color} />
        ) : (
          <span className={styles.dot} />
        )}
        <div className={styles.info}>
          <div className={styles.title}>{accumulation.description}</div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.amount}>{formatAmount(Number(accumulation.amount))}</div>
        {pending && <VLoader size={16} />}
      </div>
    </VCard>
  );
};