import { Fragment, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import commonStyles from '@/shared/styles/common.module.css';
import { formatChatDate, formatChatTime } from '@/shared/utils';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VConfirmModal } from '@/shared/ui/VConfirmModal';
import { VLoader } from '@/shared/ui/VLoader';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VTextArea } from '@/shared/ui/VTextArea';
import { VBanner } from '@/shared/ui/VBanner';
import { useAdminClearChat } from '../api/useAdminClearChat';
import { useAdminSendMessage } from '../api/useAdminSendMessage';
import { useAdminSetOpen } from '../api/useAdminSetOpen';
import { useAdminSupportChat } from '../api/useAdminSupportChat';
import { adminSupportChatsQueryKey } from '../api/useAdminSupportChats';
import styles from './ChatDetail.module.css';

interface ChatDetailProps {
  userId: string;
  email: string;
  onBack: () => void;
}

export const ChatDetail = ({ userId, email, onBack }: ChatDetailProps) => {
  const queryClient = useQueryClient();
  const chatQuery = useAdminSupportChat(userId);
  const sendMessage = useAdminSendMessage(userId);
  const setOpen = useAdminSetOpen(userId);
  const clearChat = useAdminClearChat();

  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState<string>();
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearError, setClearError] = useState<string>();
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = chatQuery.data?.messages ?? [];
  const isOpen = chatQuery.data?.isOpen ?? false;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  useEffect(() => {
    if (chatQuery.data) {
      queryClient.invalidateQueries({ queryKey: adminSupportChatsQueryKey });
    }
  }, [chatQuery.data, queryClient]);

  const handleSend = () => {
    setReplyError(undefined);
    const trimmed = reply.trim();
    if (!trimmed) {
      setReplyError('Введите сообщение');
      return;
    }
    sendMessage.mutate(trimmed, {
      onSuccess: () => setReply(''),
      onError: (error: Error) => setReplyError(error.message),
    });
  };

  const handleClear = () => {
    setClearError(undefined);
    clearChat.mutate(userId, {
      onSuccess: () => {
        setConfirmClear(false);
        onBack();
      },
      onError: (error: Error) => setClearError(error.message),
    });
  };

  return (
    <>
      <VPageHeader title={email} onBack={onBack} backAriaLabel="Назад к обращениям" />

      {!isOpen && <VBanner type="success" visible message="Проблема закрыта" />}

      <VCard className={styles.chatCard}>
        {chatQuery.isLoading ? (
          <div className={commonStyles.loaderContainer}>
            <VLoader size={28} />
          </div>
        ) : chatQuery.isError ? (
          <div className={commonStyles.textSecondary}>Не удалось загрузить чат</div>
        ) : (
          <div className={styles.messages}>
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const showDateSeparator =
                !previous ||
                formatChatDate(message.created_at) !== formatChatDate(previous.created_at);
              return (
                <Fragment key={message.id}>
                  {showDateSeparator && (
                    <div className={styles.dateSeparator}>
                      {formatChatDate(message.created_at)}
                    </div>
                  )}
                  <div
                    className={`${styles.bubble} ${
                      message.author_role === 'user' ? styles.bubbleUser : styles.bubbleAdmin
                    }`}
                  >
                    <span className={styles.messageAuthor}>
                      {message.author_role === 'admin' ? 'Вы:' : 'Пользователь:'}
                    </span>
                    <span className={styles.bubbleText}>{message.text}</span>
                    <span className={styles.messageTime}>{formatChatTime(message.created_at)}</span>
                  </div>
                </Fragment>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </VCard>

      <VTextArea
        label="Ответ"
        value={reply}
        error={replyError}
        disabled={sendMessage.isPending || clearChat.isPending}
        onChange={(value) => {
          setReply(value);
          setReplyError(undefined);
        }}
        placeholder="Ответ пользователю"
      />
      <VButton
        onClick={handleSend}
        isLoading={sendMessage.isPending}
        isDisabled={!reply.trim() || chatQuery.isLoading}
      >
        Отправить
      </VButton>

      <div className={styles.actions}>
        <VButton
          variant={isOpen ? 'danger' : 'secondary'}
          onClick={() => setOpen.mutate(!isOpen)}
          isLoading={setOpen.isPending}
          isDisabled={chatQuery.isLoading}
        >
          {isOpen ? 'Закрыть проблему' : 'Открыть проблему'}
        </VButton>
        <VButton
          variant="danger"
          onClick={() => {
            setClearError(undefined);
            setConfirmClear(true);
          }}
          isLoading={clearChat.isPending}
        >
          Очистить чат
        </VButton>
      </div>

      <VConfirmModal
        visible={confirmClear}
        title="Очистить чат"
        message="Будут удалены все сообщения между пользователем и администратором, проблема будет закрыта. Продолжить?"
        confirmLabel="Очистить"
        isLoading={clearChat.isPending}
        error={clearError}
        onCancel={() => {
          setConfirmClear(false);
          setClearError(undefined);
        }}
        onConfirm={handleClear}
      />
    </>
  );
};