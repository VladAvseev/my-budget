import type { Category } from '@/shared/supabase/services/categories';
import { useThemeStyles } from '@/shared/theme';
import { VBadge } from '@/shared/ui/VBadge';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount } from '@/shared/utils';

interface OperationCardBaseProps {
  amount: number;
  amountColor: string;
  description?: string | null;
  category?: Category | null;
  pending?: boolean;
  onOpen: () => void;
}

export const OperationCardBase = ({
  amount,
  amountColor,
  description,
  category,
  pending = false,
  onOpen,
}: OperationCardBaseProps) => {
  const styles = useThemeStyles();

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
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: styles.spacing.m,
        cursor: pending ? 'default' : 'pointer',
      }}
    >
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.xs, minWidth: 0 }}
      >
        <div
          style={{
            fontSize: styles.typography.fontSize.l,
            fontWeight: styles.typography.fontWeight.bold,
            color: amountColor,
          }}
        >
          {formatAmount(amount)}
        </div>
        {description && (
          <div
            style={{
              fontSize: styles.typography.fontSize.s,
              color: styles.colors.textSecondary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {description}
          </div>
        )}
      </div>
      {pending ? (
        <VLoader size={16} />
      ) : category?.name ? (
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