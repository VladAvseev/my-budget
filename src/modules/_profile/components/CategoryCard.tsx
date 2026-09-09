import type { Category } from '@/shared/api/types/domain';
import { VCategoryDot } from '@/shared/ui/VCategoryDot';
import { VCard } from '@/shared/ui/VCard';
import styles from './CategoryCard.module.css';

interface CategoryCardProps {
  category: Category;
  pending?: boolean;
  onClick: (category: Category) => void;
}

export const CategoryCard = ({ category, pending = false, onClick }: CategoryCardProps) => {
  const handleClick = () => {
    if (!pending) {
      onClick(category);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!pending && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(category);
    }
  };

  return (
    <VCard
      role="button"
      tabIndex={pending ? -1 : 0}
      aria-disabled={pending}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`${styles.card}${pending ? ` ${styles.pending}` : ''}`}
    >
      <div className={styles.left}>
        <VCategoryDot color={category.color ?? 'var(--color-border)'} />
        <span className={styles.name}>{category.name}</span>
      </div>
    </VCard>
  );
};
