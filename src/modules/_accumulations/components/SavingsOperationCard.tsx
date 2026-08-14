import type { Category } from '@/shared/supabase/services/categories';
import { signedOperationAmount, type OperationType } from '@/shared/supabase/services/operations';
import { useThemeStyles } from '@/shared/theme';
import { VBadge } from '@/shared/ui/VBadge';
import { VCard } from '@/shared/ui/VCard';
import { formatAmount } from '@/shared/utils';
import { useNavigate } from 'react-router-dom';
import type { SavingsOperation } from '../api/useSavingsOperations';

interface SavingsOperationCardProps {
  operation: SavingsOperation;
  category: Category | null;
}

export const SavingsOperationCard = ({ operation, category }: SavingsOperationCardProps) => {
  const styles = useThemeStyles();
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
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: styles.spacing.m,
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.xs, minWidth: 0 }}>
        <div
          style={{
            fontSize: styles.typography.fontSize.l,
            fontWeight: styles.typography.fontWeight.bold,
            color: isWithdrawal ? styles.colors.error : styles.colors.textPrimary,
          }}
        >
          {formatAmount(amount)}
        </div>
        {operation.description && (
          <div
            style={{
              fontSize: styles.typography.fontSize.s,
              color: styles.colors.textSecondary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {operation.description}
          </div>
        )}
        {operation.reportName && (
          <div
            style={{
              fontSize: styles.typography.fontSize.s,
              color: styles.colors.textSecondary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {operation.reportName}
          </div>
        )}
      </div>
      {category?.name ? (
        <VBadge
          color={category?.color ?? undefined}
          style={{
            fontSize: styles.typography.fontSize.m,
            fontWeight: styles.typography.fontWeight.medium,
            color: styles.colors.textPrimary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {category?.name}
        </VBadge>
      ) : null}
    </VCard>
  );
};