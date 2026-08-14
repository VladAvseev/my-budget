import { VButton } from '@/shared/ui/VButton';
import { VModal } from '@/shared/ui/VModal';
import type { CSSProperties } from 'react';

export interface VConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  width?: string;
  isLoading?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
  style?: CSSProperties;
}

export const VConfirmModal = ({
  visible,
  title,
  message,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  width,
  isLoading,
  error,
  onCancel,
  onConfirm,
  style,
}: VConfirmModalProps) => {
  return (
    <VModal
      visible={visible}
      title={title}
      onClose={onCancel}
      error={error}
      width={width}
      style={style}
      footer={
        <>
          <VButton variant="secondary" onClick={onCancel} isDisabled={isLoading}>
            {cancelLabel}
          </VButton>
          <VButton variant="danger" isLoading={isLoading} onClick={onConfirm}>
            {confirmLabel}
          </VButton>
        </>
      }
    >
      <div>{message}</div>
    </VModal>
  );
};