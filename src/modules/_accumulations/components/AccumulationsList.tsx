import { useAuth } from '@/shared/supabase/authProvider';
import { useAccumulations } from '@/shared/hooks';
import { VAccordion } from '@/shared/ui/VAccordion';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatAmount } from '@/shared/utils';
import { useCategories } from '../api/useCategories';
import { groupItemsByCategory } from '../utils/groupByCategory';
import { AccumulationCard } from './AccumulationCard';
import styles from './AccumulationsList.module.css';

export const AccumulationsList = () => {
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
    <div className={styles.root}>
      {accumulationsQuery.error && (
        <VBanner type="error" visible message="Не удалось загрузить накопления" />
      )}

      {accumulationsQuery.isLoading && (
        <div className={styles.loaderWrap}>
          <VLoader size={28} />
        </div>
      )}

      {!accumulationsQuery.isLoading &&
        !accumulationsQuery.error &&
        accumulations.length === 0 && (
          <VCard>
            <div className={styles.empty}>Нет накоплений</div>
          </VCard>
        )}

      {!accumulationsQuery.isLoading && accumulations.length > 0 && (
        <div className={styles.list}>
          {groups.map((group) => (
            <VAccordion
              key={group.key}
              header={
                <span className={styles.accordionHeader}>
                  <span
                    className={styles.accordionDot}
                    style={{ backgroundColor: group.color ?? 'var(--color-border)' }}
                  />
                  <span className={styles.accordionLabel}>{group.label}</span>
                  <span className={styles.accordionTotal}>
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
              <div className={styles.items}>
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