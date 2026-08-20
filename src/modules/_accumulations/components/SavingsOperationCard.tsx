import type { Category } from '@/shared/supabase/types/domain';
import { signedOperationAmount, type OperationType } from '@/shared/supabase/types/domain';
import { VBadge } from '@/shared/ui/VBadge';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount } from '@/shared/utils';
import { useNavigate } from 'react-router-dom';
import type { SavingsOperation } from '../api/useSavingsOperations';
import styles from './SavingsOperationCard.module.css';

interface SavingsOperationCardProps {
  operation: SavingsOperation;
  category: Category | null;
}

export const SavingsOperationCard = ({ operation, category }: SavingsOperationCardProps) => {
  const navigate = useNavigate();

  const isWithdrawal = operation.type === 'savings_out';
  const amount = signedOperationAmount(operation.type as OperationType, Number(operation.amount) || 0);

  return (
    <VCard
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/reports/${operation.report_id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate(`/reports/${operation.report_id}`);
        }
      }}
      className={styles.card}
    >
      <div className={styles.left}>
        <div className={`${styles.amount}${isWithdrawal ? ` ${styles.amountWithdrawal}` : ''}`}>
          {formatAmount(amount)}
        </div>
        {operation.description && (
          <div className={styles.subtitle}>{operation.description}</div>
        )}
        {operation.reportName && (
          <div className={styles.subtitle}>{operation.reportName}</div>
        )}
      </div>
      {category?.name ? (
        <VBadge color={category?.color ?? undefined} className={styles.badge}>
          {category?.name}
        </VBadge>
      ) : null}
    </VCard>
  );
};