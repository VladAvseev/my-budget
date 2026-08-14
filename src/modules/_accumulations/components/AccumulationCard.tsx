import type { Category } from '@/shared/supabase/services/categories';
import type { Accumulation } from '@/shared/supabase/services/accumulations';
import { useThemeStyles } from '@/shared/theme';
import { VCategoryDot } from '@/shared/ui/VCategoryDot';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount } from '@/shared/utils';
import { useSetAtom } from 'jotai';
import { accumulationModalAtom } from '../atoms/accumulations';

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
  const styles = useThemeStyles();
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
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: styles.spacing.m,
        cursor: pending ? 'default' : 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: styles.spacing.m, minWidth: 0 }}>
        {category?.color ? (
          <VCategoryDot color={category.color} />
        ) : (
          <span
            style={{
              width: 16,
              height: 16,
              flexShrink: 0,
              borderRadius: styles.radius.round,
              backgroundColor: styles.colors.bgSurface,
              border: `1px solid ${styles.colors.border}`,
            }}
          />
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: styles.spacing.xs,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: styles.typography.fontSize.l,
              fontWeight: styles.typography.fontWeight.bold,
              color: styles.colors.textPrimary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {accumulation.description}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: styles.spacing.m,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: styles.typography.fontSize.l,
            fontWeight: styles.typography.fontWeight.bold,
            color: styles.colors.textPrimary,
          }}
        >
          {formatAmount(Number(accumulation.amount))}
        </div>
        {pending && <VLoader size={16} />}
      </div>
    </VCard>
  );
};