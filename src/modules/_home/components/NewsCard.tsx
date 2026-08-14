import { ClearIcon } from '@/shared/icons';
import { VCard } from '@/shared/ui/VCard';
import { VIconButton } from '@/shared/ui/VIconButton';
import { useHideNews } from '../api/useHideNews';
import { useShowNews } from '../api/useShowNews';
import styles from '../homeCard.module.css';

export const NewsCard = () => {
  const { showNews, isLoading, error } = useShowNews();
  const hideNews = useHideNews();

  if (isLoading || error || !showNews) {
    return null;
  }

  return (
    <VCard className={styles.newsCard}>
      <div className={styles.title}>Что нового?</div>
      <div className={styles.subtitle}>
        В настройках отчётов добавлена возможность устанавливать лимиты для категорий
        расходов.
      </div>
      <div className={styles.closeButton}>
        <VIconButton
          ariaLabel="Закрыть"
          onClick={() => hideNews.mutate()}
          isLoading={hideNews.isPending}
          color="var(--color-text-secondary)"
        >
          <ClearIcon size={18} color="var(--color-text-secondary)" />
        </VIconButton>
      </div>
    </VCard>
  );
};