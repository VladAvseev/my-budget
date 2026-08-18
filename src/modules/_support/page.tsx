import { Fragment, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/supabase/authProvider';
import commonStyles from '@/shared/styles/common.module.css';
import { formatChatDate, formatChatTime } from '@/shared/utils';
import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { VTextArea } from '@/shared/ui/VTextArea';
import { VBanner } from '@/shared/ui/VBanner';
import { useMarkSupportRead } from './api/useMarkSupportRead';
import { useSendSupportMessage } from './api/useSendSupportMessage';
import { useSupportChat } from './api/useSupportChat';
import styles from './page.module.css';

export const Page: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const chatQuery = useSupportChat(userId);
  const sendMessage = useSendSupportMessage(userId);
  const markRead = useMarkSupportRead(userId);

  const [text, setText] = useState('');
  const [textError, setTextError] = useState<string>();
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = chatQuery.data?.messages ?? [];
  const isOpen = chatQuery.data?.isOpen ?? false;
  const hasChat = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  useEffect(() => {
    if (
      chatQuery.data &&
      chatQuery.data.chatExists &&
      chatQuery.data.unreadCount > 0 &&
      !markRead.isPending
    ) {
      markRead.mutate();
    }
  }, [chatQuery.data, markRead]);

  const handleSend = () => {
    setTextError(undefined);
    const trimmed = text.trim();
    if (!trimmed) {
      setTextError('Введите сообщение');
      return;
    }
    sendMessage.mutate(trimmed, {
      onSuccess: () => setText(''),
      onError: (error: Error) => setTextError(error.message),
    });
  };

  return (
    <div className={commonStyles.page}>
      <VPageHeader title="Поддержка" onBack={() => navigate('/')} backAriaLabel="Назад на главную" />

      {hasChat && !isOpen && (
        <VBanner
          type="warning"
          visible
          message="Проблема закрыта. Напишите сообщение, чтобы открыть её снова."
        />
      )}

      <VCard className={styles.chatCard}>
        {chatQuery.isLoading ? (
          <div className={commonStyles.loaderContainer}>
            <VLoader size={28} />
          </div>
        ) : chatQuery.isError ? (
          <div className={commonStyles.textSecondary}>Не удалось загрузить чат</div>
        ) : !hasChat ? (
          <div className={styles.empty}>
            Здесь вы можете задать вопрос или сообщить об ошибке. Мы ответим в ближайшее время.
          </div>
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
                      {message.author_role === 'user' ? 'Вы:' : 'Администратор:'}
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
        label="Сообщение"
        value={text}
        error={textError}
        disabled={sendMessage.isPending}
        onChange={(value) => {
          setText(value);
          setTextError(undefined);
        }}
        placeholder="Опишите проблему или вопрос"
      />
      <VButton
        onClick={handleSend}
        isLoading={sendMessage.isPending}
        isDisabled={!text.trim() || chatQuery.isLoading}
      >
        Отправить
      </VButton>
    </div>
  );
};