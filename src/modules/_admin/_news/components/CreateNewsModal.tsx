import modalStyles from '@/shared/styles/modal.module.css';
import { getErrorMessage } from '@/shared/utils';
import { VButton } from '@/shared/ui/VButton';
import { VModal } from '@/shared/ui/VModal';
import { VTextArea } from '@/shared/ui/VTextArea';
import { useState } from 'react';
import { useCreateNews } from '../api/useAdminNews';

interface CreateNewsModalProps {
  onClose: () => void;
}

export const CreateNewsModal = ({ onClose }: CreateNewsModalProps) => {
  const createNews = useCreateNews();

  const [text, setText] = useState('');
  const [textError, setTextError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const isPending = createNews.isPending;

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

    createNews.mutate(text.trim(), {
      onSuccess: onClose,
      onError: (error: Error) => setSubmitError(getErrorMessage(error)),
    });
  };

  return (
    <VModal
      visible
      title="Новая новость"
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
