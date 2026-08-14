import { useAuth } from '@/shared/supabase/authProvider';
import { useAccumulations } from '@/shared/hooks';
import { useThemeStyles } from '@/shared/theme';
import { VAccordion } from '@/shared/ui/VAccordion';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount } from '@/shared/utils';
import { useCategories } from '../api/useCategories';
import { groupItemsByCategory } from '../utils/groupByCategory';
import { AccumulationCard } from './AccumulationCard';

export const AccumulationsList = () => {
  const styles = useThemeStyles();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const accumulationsQuery = useAccumulations(userId);
  const categoriesQuery = useCategories(userId);

  const accumulations = accumulationsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const groups = groupItemsByCategory(
    accumulations,
    categories,
    (accumulation) => accumulation.category_id,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
      {accumulationsQuery.error && (
        <VBanner type="error" visible message="Не удалось загрузить накопления" />
      )}

      {accumulationsQuery.isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: styles.spacing.xl }}>
          <VLoader size={28} />
        </div>
      )}

      {!accumulationsQuery.isLoading &&
        !accumulationsQuery.error &&
        accumulations.length === 0 && (
          <VCard>
            <div style={{ color: styles.colors.textSecondary }}>Нет накоплений</div>
          </VCard>
        )}

      {!accumulationsQuery.isLoading && accumulations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.m }}>
          {groups.map((group) => (
            <VAccordion
              key={group.key}
              header={
                <span style={{ display: 'flex', alignItems: 'center', gap: styles.spacing.m }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      flexShrink: 0,
                      borderRadius: styles.radius.round,
                      backgroundColor: group.color ?? styles.colors.border,
                    }}
                  />
                  <span style={{ flex: 1, minWidth: 0 }}>{group.label}</span>
                  <span style={{ fontWeight: styles.typography.fontWeight.bold }}>
                    {formatAmount(
                      group.items.reduce(
                        (sum, accumulation) => sum + (Number(accumulation.amount) || 0),
                        0,
                      ),
                    )}
                  </span>
                </span>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.m }}>
                {group.items.map((accumulation) => (
                  <AccumulationCard
                    key={accumulation.id}
                    accumulation={accumulation}
                    pending={Boolean((accumulation as { _optimistic?: boolean })._optimistic)}
                    category={
                      accumulation.category_id
                        ? categories.find((category) => category.id === accumulation.category_id) ??
                          null
                        : null
                    }
                  />
                ))}
              </div>
            </VAccordion>
          ))}
        </div>
      )}
    </div>
  );
};