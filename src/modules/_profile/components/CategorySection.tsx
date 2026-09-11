import type { CategoryType } from '@/shared/api/types/domain';
import type { Category } from '@/shared/api/types/domain';
import { PlusIcon } from '@/shared/icons';
import { useAuth } from '@/shared/api/authProvider';
import { VBanner } from '@/shared/ui/VBanner';
import { VButtonGroup } from '@/shared/ui/VButtonGroup';
import { VCard } from '@/shared/ui/VCard';
import { VConfirmModal } from '@/shared/ui/VConfirmModal';
import { VErrorCard } from '@/shared/ui/VErrorCard';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VSkeletonList } from '@/shared/ui/VSkeleton';
import commonStyles from '@/shared/styles/common.module.css';
import { useState } from 'react';
import { useCategories } from '../api/useCategories';
import { useRemoveCategory } from '../api/useRemoveCategory';
import { AddCategoryModal } from './AddCategoryModal';
import { CategoryCard } from './CategoryCard';
import { EditCategoryModal } from './EditCategoryModal';
import styles from './CategorySection.module.css';

const TABS: { value: CategoryType; label: string }[] = [
  { value: 'expense', label: 'Расходы' },
  { value: 'income', label: 'Доходы' },
  { value: 'savings', label: 'Накопления' },
];

export const CategorySection = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [activeType, setActiveType] = useState<CategoryType>('expense');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const categoriesQuery = useCategories(userId, activeType);
  const removeCategory = useRemoveCategory(userId);

  const categories = categoriesQuery.data ?? [];

  const handleRequestDelete = (category: Category) => {
    setEditingCategory(null);
    setDeletingCategory(category);
  };

  const handleConfirmDelete = () => {
    if (!deletingCategory) return;
    removeCategory.mutate(deletingCategory.id, {
      onSuccess: () => setDeletingCategory(null),
    });
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={commonStyles.titleXl}>Категории операций</div>
      </div>

      <div className={styles.toolbar}>
        <VButtonGroup options={TABS} value={activeType} onChange={setActiveType} fullWidth />
        <VIconButton
          ariaLabel="Добавить категорию"
          onClick={() => setIsAddOpen(true)}
          color="var(--color-accent)"
        >
          <PlusIcon size={24} color="currentColor" />
        </VIconButton>
      </div>

      {categoriesQuery.error && categoriesQuery.data == null && (
        <VErrorCard
          title="Не удалось загрузить категории"
          error={categoriesQuery.error}
          onRetry={() => void categoriesQuery.refetch()}
          isRetrying={categoriesQuery.isFetching}
        />
      )}

      {categoriesQuery.error && categoriesQuery.data != null && (
        <VBanner type="error" visible message="Не удалось загрузить категории" />
      )}

      {categoriesQuery.isLoading && (
        <VSkeletonList count={5} cardProps={{ compact: true, title: false, lines: 1 }} />
      )}

      {!categoriesQuery.isLoading && !categoriesQuery.error && categories.length === 0 && (
        <VCard>
          <div className={styles.emptyState}>
            <div className={commonStyles.emptyTitle}>
              Категория помогает распределить операции по группам для наглядной статистики.
            </div>
            <div className={commonStyles.emptyHint}>
              Нажмите «+», чтобы добавить первую категорию.
            </div>
          </div>
        </VCard>
      )}

      {!categoriesQuery.isLoading && categories.length > 0 && (
        <div className={styles.list}>
          {categories.map((category, index) => {
            const isOptimistic = Boolean((category as { _optimistic?: boolean })._optimistic);

            return (
              <div
                key={category.id}
                className={commonStyles.animateCard}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <CategoryCard
                  category={category}
                  pending={isOptimistic}
                  onClick={() => setEditingCategory(category)}
                />
              </div>
            );
          })}
        </div>
      )}

      <AddCategoryModal type={activeType} visible={isAddOpen} onClose={() => setIsAddOpen(false)} />

      {editingCategory && (
        <EditCategoryModal
          key={editingCategory.id}
          category={editingCategory}
          visible
          onClose={() => setEditingCategory(null)}
          onRequestDelete={handleRequestDelete}
        />
      )}

      <VConfirmModal
        visible={Boolean(deletingCategory)}
        title="Удалить категорию"
        message={
          deletingCategory
            ? `Удалить категорию «${deletingCategory.name}»? Все операции с этой категорией будут без категории.`
            : 'Удалить категорию?'
        }
        confirmLabel="Удалить"
        isLoading={removeCategory.isPending}
        onCancel={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
