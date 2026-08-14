import type { CategoryType } from '@/shared/supabase/services/categories';
import { VCategoryDot } from '@/shared/ui/VCategoryDot';
import { VSelect } from '@/shared/ui/VSelect';
import { useMemo } from 'react';
import { useCategories } from '../../../api/useCategories';

interface CategorySelectProps {
  userId: string;
  categoryType: CategoryType;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export const CategorySelect = ({
  userId,
  categoryType,
  value,
  disabled = false,
  onChange,
}: CategorySelectProps) => {
  const categoriesQuery = useCategories(userId, categoryType);

  const options = useMemo(() => {
    const queryCategories = categoriesQuery.data ?? [];
    return [
      { value: '', label: 'Без категории' },
      ...queryCategories.map((category) => ({
        value: category.id,
        label: category.name,
        ...(category.color ? { prefix: <VCategoryDot color={category.color} /> } : {}),
      })),
    ];
  }, [categoriesQuery.data]);

  return (
    <VSelect
      label="Категория"
      options={options}
      value={value}
      disabled={disabled}
      onChange={onChange}
    />
  );
};