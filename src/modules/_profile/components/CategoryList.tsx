import type { CategoryType } from '@/shared/supabase/services/categories';
import type { Category } from '@/shared/supabase/services/categories';
import { PencilIcon, PlusIcon, TrashIcon } from '@/shared/icons';
import { useAuth } from '@/shared/supabase/authProvider';
import { useThemeStyles } from '@/shared/theme';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VConfirmModal } from '@/shared/ui/VConfirmModal';
import { VLoader } from '@/shared/ui/VLoader';
import { VIconButton } from '@/shared/ui/VIconButton';
import { useState } from 'react';
import { useCategories } from '../api/useCategories';
import { useRemoveCategory } from '../api/useRemoveCategory';
import { AddCategoryModal } from './AddCategoryModal';
import { EditCategoryModal } from './EditCategoryModal';

interface CategoryListProps {
  type: CategoryType;
  title: string;
}

export const CategoryList = ({ type, title }: CategoryListProps) => {
  const styles = useThemeStyles();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const categoriesQuery = useCategories(userId, type);
  const removeCategory = useRemoveCategory(userId);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const categories = categoriesQuery.data ?? [];

  return (
    <VCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacing.l }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: styles.spacing.m,
          }}
        >
          <div
            style={{
              fontSize: styles.typography.fontSize.xl,
              fontWeight: styles.typography.fontWeight.bold,
              color: styles.colors.textPrimary,
            }}
          >
            {title}
          </div>
          <VIconButton
            ariaLabel={`Добавить категорию в разделе «${title}»`}
            onClick={() => setIsAddOpen(true)}
            color={styles.colors.accent}
          >
            <PlusIcon size={24} color={styles.colors.accent} />
          </VIconButton>
        </div>

        {categoriesQuery.error && (
          <VBanner type="error" visible message="Не удалось загрузить категории" />
        )}

        {categoriesQuery.isLoading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: styles.spacing.xl,
            }}
          >
            <VLoader size={28} />
          </div>
        )}

        {!categoriesQuery.isLoading && !categoriesQuery.error && categories.length === 0 && (
          <div style={{ color: styles.colors.textSecondary }}>Нет категорий</div>
        )}

        {!categoriesQuery.isLoading &&
          categories.map((category, index) => {
            const isOptimistic = Boolean((category as { _optimistic?: boolean })._optimistic);

            return (
              <div
                key={category.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: styles.spacing.m,
                  paddingBottom: styles.spacing.m,
                  borderBottom:
                    index < categories.length - 1 ? `1px solid ${styles.colors.border}` : 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: styles.spacing.s,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      flexShrink: 0,
                      borderRadius: styles.radius.round,
                      backgroundColor: category.color ?? styles.colors.bgSurface,
                      border: `1px solid ${category.color ?? styles.colors.border}`,
                    }}
                  />
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: styles.typography.fontSize.m,
                      color: styles.colors.textPrimary,
                    }}
                  >
                    {category.name}
                  </span>
                </div>
                {isOptimistic ? (
                  <VLoader size={16} />
                ) : (
                  <div style={{ display: 'flex', gap: styles.spacing.s, flexShrink: 0 }}>
                    <VIconButton
                      ariaLabel={`Изменить категорию «${category.name}»`}
                      onClick={() => setEditingCategory(category)}
                      color={styles.colors.accent}
                    >
                      <PencilIcon size={18} color={styles.colors.accent} />
                    </VIconButton>
                    <VIconButton
                      ariaLabel={`Удалить категорию «${category.name}»`}
                      onClick={() => setDeletingCategory(category)}
                      color={styles.colors.error}
                    >
                      <TrashIcon size={18} color={styles.colors.error} />
                    </VIconButton>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      <AddCategoryModal type={type} visible={isAddOpen} onClose={() => setIsAddOpen(false)} />

      {editingCategory && (
        <EditCategoryModal
          key={editingCategory.id}
          category={editingCategory}
          visible
          onClose={() => setEditingCategory(null)}
        />
      )}

      <VConfirmModal
        visible={Boolean(deletingCategory)}
        title="Удалить категорию"
        message={
          deletingCategory
            ? `Удалить категорию «${deletingCategory.name}»? Все операции с этой категорией будут без категории.`
            : 'Удалить категорию? Все операции с этой категорией будут без категории.'
        }
        confirmLabel="Удалить"
        isLoading={removeCategory.isPending}
        onCancel={() => setDeletingCategory(null)}
        onConfirm={() =>
          removeCategory.mutate(deletingCategory?.id ?? '', {
            onSuccess: () => setDeletingCategory(null),
          })
        }
      />
    </VCard>
  );
};
