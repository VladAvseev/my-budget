import { ClearIcon } from '@/shared/icons';
import { VCard } from '@/shared/ui/VCard';
import { VIconButton } from '@/shared/ui/VIconButton';
import { useHideNews } from '../api/useHideNews';
import { useNews } from '../api/useNews';
import { useShowNews } from '../api/useShowNews';
import styles from '../homeCard.module.css';

export const NewsCard = () => {
  const { showNews, isLoading: isShowNewsLoading, error: showNewsError } = useShowNews();
  const { data: news, isLoading: isNewsLoading, error: newsError } = useNews();
  const hideNews = useHideNews();

  if (
    isShowNewsLoading ||
    isNewsLoading ||
    showNewsError ||
    newsError ||
    !showNews ||
    !news?.text
  ) {
    return null;
  }

  return (
    <VCard className={styles.newsCard}>
      <div className={styles.title}>Что нового?</div>
      <div className={styles.subtitle}>{news.text}</div>
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
