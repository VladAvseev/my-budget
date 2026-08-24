import type { NewsRow } from '@/shared/supabase/types/domain';
import { getErrorMessage } from '@/shared/utils';
import { VConfirmModal } from '@/shared/ui/VConfirmModal';
import { useState } from 'react';
import { useDeleteNews } from '../api/useAdminNews';

interface DeleteNewsModalProps {
  news: NewsRow;
  onClose: () => void;
}

export const DeleteNewsModal = ({ news, onClose }: DeleteNewsModalProps) => {
  const deleteNews = useDeleteNews();
  const [submitError, setSubmitError] = useState<string>();

  const handleConfirm = () => {
    setSubmitError(undefined);
    deleteNews.mutate(news.id, {
      onSuccess: onClose,
      onError: (error: Error) => setSubmitError(getErrorMessage(error)),
    });
  };

  return (
    <VConfirmModal
      visible
      title="Удалить новость?"
      message="Это действие нельзя отменить."
      confirmLabel="Удалить"
      isLoading={deleteNews.isPending}
      error={submitError}
      onCancel={onClose}
      onConfirm={handleConfirm}
    />
  );
};
