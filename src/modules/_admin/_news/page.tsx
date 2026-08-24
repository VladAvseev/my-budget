import { PencilIcon, PlusIcon, TrashIcon } from '@/shared/icons';
import commonStyles from '@/shared/styles/common.module.css';
import type { NewsRow } from '@/shared/supabase/types/domain';
import { VButton } from '@/shared/ui/VButton';
import { VIconButton } from '@/shared/ui/VIconButton';
import { VLoader } from '@/shared/ui/VLoader';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { useState } from 'react';
import { useAdminNewsList, useSetShowNews } from './api/useAdminNews';
import { CreateNewsModal } from './components/CreateNewsModal';
import { DeleteNewsModal } from './components/DeleteNewsModal';
import { EditNewsModal } from './components/EditNewsModal';
import styles from './page.module.css';

export const Page: React.FC = () => {
  const newsListQuery = useAdminNewsList();
  const setShowNews = useSetShowNews();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsRow | null>(null);
  const [deletingNews, setDeletingNews] = useState<NewsRow | null>(null);

  if (newsListQuery.isLoading) {
    return (
      <div className={commonStyles.loaderContainer}>
        <VLoader size={28} />
      </div>
    );
  }

  if (newsListQuery.isError) {
    return (
      <div className={commonStyles.page}>
        <VPageHeader title="Что нового?" />
        <div className={commonStyles.textSecondary}>Не удалось загрузить новости</div>
      </div>
    );
  }

  const newsList = newsListQuery.data ?? [];

  return (
    <div className={commonStyles.page}>
      <VPageHeader
        title="Что нового?"
        right={
          <div className={styles.headerActions}>
            <VButton
              variant="secondary"
              isLoading={setShowNews.isPending}
              onClick={() => setShowNews.mutate(true)}
            >
              Показать всем
            </VButton>
            <VButton
              variant="danger"
              isLoading={setShowNews.isPending}
              onClick={() => setShowNews.mutate(false)}
            >
              Скрыть от всех
            </VButton>
            <VButton onClick={() => setCreateOpen(true)}>
              <PlusIcon size={18} color="currentColor" />
              Добавить
            </VButton>
          </div>
        }
      />

      {newsList.length === 0 ? (
        <div className={commonStyles.textSecondary}>Новостей пока нет</div>
      ) : (
        <div className={styles.newsList}>
          {newsList.map((news) => (
            <div key={news.id} className={styles.newsItem}>
              <div className={styles.newsItemContent}>
                <div className={styles.newsItemText}>{news.text}</div>
                {news.created_at && (
                  <div className={styles.newsItemDate}>
                    {new Date(news.created_at).toLocaleDateString('ru-RU')}
                  </div>
                )}
              </div>
              <div className={styles.newsItemActions}>
                <VIconButton
                  ariaLabel="Редактировать"
                  onClick={() => setEditingNews(news)}
                  color="var(--color-text-secondary)"
                >
                  <PencilIcon size={18} color="currentColor" />
                </VIconButton>
                <VIconButton
                  ariaLabel="Удалить"
                  onClick={() => setDeletingNews(news)}
                  color="var(--color-error)"
                >
                  <TrashIcon size={18} color="currentColor" />
                </VIconButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {createOpen && <CreateNewsModal onClose={() => setCreateOpen(false)} />}
      {editingNews && (
        <EditNewsModal news={editingNews} onClose={() => setEditingNews(null)} />
      )}
      {deletingNews && (
        <DeleteNewsModal news={deletingNews} onClose={() => setDeletingNews(null)} />
      )}
    </div>
  );
};
