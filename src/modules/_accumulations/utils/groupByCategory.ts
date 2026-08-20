import type { Category } from '@/shared/supabase/types/domain';

export interface CategorizedGroup<T> {
  key: string;
  label: string;
  color: string | null;
  items: T[];
}

export function groupItemsByCategory<T>(
  items: T[],
  categories: Category[],
  getCategoryId: (item: T) => string | null,
): CategorizedGroup<T>[] {
  const categoriesById = new Map(categories.map((category) => [category.id, category]));

  const groups = new Map<string, CategorizedGroup<T>>();
  for (const category of categories) {
    groups.set(category.id, {
      key: category.id,
      label: category.name,
      color: category.color,
      items: [],
    });
  }
  groups.set('none', {
    key: 'none',
    label: 'Без категории',
    color: null,
    items: [],
  });

  for (const item of items) {
    const categoryId = getCategoryId(item);
    const category = categoryId ? categoriesById.get(categoryId) : null;
    const key = category ? category.id : 'none';
    const group = groups.get(key);
    if (group) {
      group.items.push(item);
    }
  }

  return [...groups.values()].filter((group) => group.items.length > 0);
}