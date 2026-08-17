import commonStyles from '@/shared/styles/common.module.css';
import { VButton } from '@/shared/ui/VButton';
import { VLoader } from '@/shared/ui/VLoader';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VTextArea } from '@/shared/ui/VTextArea';
import { useState } from 'react';
import { useAdminNews, useSetShowNews, useUpdateNews } from './api/useAdminNews';
import styles from './page.module.css';

export const Page: React.FC = () => {
  const newsQuery = useAdminNews();
  const updateNews = useUpdateNews();
  const setShowNews = useSetShowNews();

  const savedText = newsQuery.data?.text ?? '';

  const [text, setText] = useState(savedText);

  const [prevSavedText, setPrevSavedText] = useState(savedText);
  if (prevSavedText !== savedText) {
    setPrevSavedText(savedText);
    setText(savedText);
  }

  const isDirty = text !== savedText;

  if (newsQuery.isLoading) {
    return (
      <div className={commonStyles.loaderContainer}>
        <VLoader size={28} />
      </div>
    );
  }

  if (newsQuery.isError) {
    return (
      <div className={commonStyles.page}>
        <VPageHeader title="Что нового?" />
        <div className={commonStyles.textSecondary}>Не удалось загрузить новость</div>
      </div>
    );
  }

  return (
    <div className={commonStyles.page}>
      <VPageHeader
        title="Что нового?"
        right={
          <div className={styles.newsHeaderActions}>
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
          </div>
        }
      />
      <VTextArea
        label="Текст новости"
        value={text}
        onChange={setText}
        placeholder="Текст новости"
      />
      <div className={styles.actions}>
        <VButton
          variant="primary"
          isDisabled={!isDirty}
          isLoading={updateNews.isPending}
          onClick={() => updateNews.mutate(text)}
        >
          Сохранить
        </VButton>
        <VButton variant="secondary" isDisabled={!isDirty} onClick={() => setText(savedText)}>
          Отменить
        </VButton>
      </div>
    </div>
  );
};
