import type { Operation } from '@/shared/supabase/services/operations';
import { useThemeStyles } from '@/shared/theme';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount, formatDisplay } from '@/shared/utils';
import { useSetAtom } from 'jotai';
import { operationModalAtom } from '../../atoms/report';

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
  const styles = useThemeStyles();
  const setModal = useSetAtom(operationModalAtom);

  const amount = Number(operation.amount) || 0;
  const deviation = dailyBudget != null ? amount - dailyBudget : null;
  const deviationColor =
    deviation != null ? (deviation > 0 ? styles.colors.error : styles.colors.success) : undefined;

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
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: styles.spacing.m,
        cursor: pending ? 'default' : 'pointer',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start ',
            gap: styles.spacing.xs,
          }}
        >
          <div
            style={{
              fontSize: styles.typography.fontSize.l,
              fontWeight: styles.typography.fontWeight.bold,
              color: styles.colors.textPrimary,
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
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: styles.spacing.xs,
            minWidth: 0,
          }}
        >
          {deviation != null && (
            <div style={{ fontSize: styles.typography.fontSize.l, color: deviationColor }}>
              {formatAmount(Math.abs(deviation))}
            </div>
          )}
          <div
            style={{
              fontSize: styles.typography.fontSize.s,
              fontWeight: styles.typography.fontWeight.medium,
              color: styles.colors.textPrimary,
            }}
          >
            {formatDisplay(operation.date ?? '')}
          </div>
        </div>
      </div>
      {pending && <VLoader size={16} />}
    </VCard>
  );
};