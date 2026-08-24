import type { NewsRow } from '@/shared/supabase/types/domain';
import modalStyles from '@/shared/styles/modal.module.css';
import { getErrorMessage } from '@/shared/utils';
import { VButton } from '@/shared/ui/VButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextArea } from '@/shared/ui/VTextArea';
import { useState } from 'react';
import { useEditNews } from '../api/useAdminNews';

interface EditNewsModalProps {
  news: NewsRow;
  onClose: () => void;
}

export const EditNewsModal = ({ news, onClose }: EditNewsModalProps) => {
  const editNews = useEditNews();

  const [text, setText] = useState(news.text);
  const [textError, setTextError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const isPending = editNews.isPending;

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleSubmit = () => {
    setSubmitError(undefined);

    if (!text.trim()) {
      setTextError('Укажите текст новости');
      return;
    }
    setTextError(undefined);

    editNews.mutate(
      { id: news.id, text: text.trim() },
      {
        onSuccess: onClose,
        onError: (error: Error) => setSubmitError(getErrorMessage(error)),
      },
    );
  };

  return (
    <VModal
      visible
      title="Редактировать новость"
      onClose={handleClose}
      error={submitError}
      footer={
        <>
          <VButton variant="secondary" onClick={handleClose} isDisabled={isPending}>
            Отмена
          </VButton>
          <VButton onClick={handleSubmit} isLoading={isPending}>
            Сохранить
          </VButton>
        </>
      }
    >
      <div className={modalStyles.content}>
        <VTextArea
          label="Текст новости"
          value={text}
          error={textError}
          disabled={isPending}
          placeholder="Текст новости"
          onChange={(value) => {
            setText(value);
            setTextError(undefined);
          }}
        />
      </div>
    </VModal>
  );
};
