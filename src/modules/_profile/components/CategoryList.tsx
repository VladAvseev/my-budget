import type { CategoryType } from '@/shared/supabase/services/categories';
import type { Category } from '@/shared/supabase/services/categories';
import { PencilIcon, PlusIcon, TrashIcon } from '@/shared/icons';
import { useAuth } from '@/shared/supabase/authProvider';
import { VBanner } from '@/shared/ui/VBanner';
import { VCard } from '@/shared/ui/VCard';
import { VConfirmModal } from '@/shared/ui/VConfirmModal';
import { VLoader } from '@/shared/ui/VLoader';
import { VIconButton } from '@/shared/ui/VIconButton';
import commonStyles from '@/shared/styles/common.module.css';
import { useState } from 'react';
import { useCategories } from '../api/useCategories';
import { useRemoveCategory } from '../api/useRemoveCategory';
import { AddCategoryModal } from './AddCategoryModal';
import { EditCategoryModal } from './EditCategoryModal';
import styles from './CategoryList.module.css';

interface CategoryListProps {
  type: CategoryType;
  title: string;
}

export const CategoryList = ({ type, title }: CategoryListProps) => {
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
      <div className={styles.cardBody}>
        <div className={styles.header}>
          <div className={commonStyles.titleXl}>
            {title}
          </div>
          <VIconButton
            ariaLabel={`Добавить категорию в разделе «${title}»`}
            onClick={() => setIsAddOpen(true)}
            color="var(--color-accent)"
          >
            <PlusIcon size={24} color="currentColor" />
          </VIconButton>
        </div>

        {categoriesQuery.error && (
          <VBanner type="error" visible message="Не удалось загрузить категории" />
        )}

        {categoriesQuery.isLoading && (
          <div className={commonStyles.loaderContainer}>
            <VLoader size={28} />
          </div>
        )}

        {!categoriesQuery.isLoading && !categoriesQuery.error && categories.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateTitle}>Категорий пока нет</div>
            <div className={styles.emptyStateHint}>Нажмите «+», чтобы добавить первую категорию.</div>
          </div>
        )}

        {!categoriesQuery.isLoading &&
          categories.map((category, index) => {
            const isOptimistic = Boolean((category as { _optimistic?: boolean })._optimistic);

            return (
              <div
                key={category.id}
                className={`${styles.item}${index < categories.length - 1 ? ` ${styles.itemBorder}` : ''}`}
              >
                <div className={styles.itemBody}>
                  <span
                    className={styles.itemDot}
                    style={{
                      backgroundColor: category.color ?? 'var(--color-bg-surface)',
                      borderColor: category.color ?? 'var(--color-border)',
                    }}
                  />
                  <span className={styles.itemName}>{category.name}</span>
                </div>
                {isOptimistic ? (
                  <VLoader size={16} />
                ) : (
                  <div className={commonStyles.actions}>
                    <VIconButton
                      ariaLabel={`Изменить категорию «${category.name}»`}
                      onClick={() => setEditingCategory(category)}
                      color="var(--color-accent)"
                    >
                      <PencilIcon size={18} color="currentColor" />
                    </VIconButton>
                    <VIconButton
                      ariaLabel={`Удалить категорию «${category.name}»`}
                      onClick={() => setDeletingCategory(category)}
                      color="var(--color-error)"
                    >
                      <TrashIcon size={18} color="currentColor" />
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