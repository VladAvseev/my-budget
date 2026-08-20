import commonStyles from '@/shared/styles/common.module.css';
import type { AdminSupportChat } from '@/shared/supabase/types/domain';
import { VBadge } from '@/shared/ui/VBadge';
import { VCard } from '@/shared/ui/VCard';
import { VLoader } from '@/shared/ui/VLoader';
import { formatDisplay } from '@/shared/utils/date';
import styles from './ChatList.module.css';

interface ChatListProps {
  chats: AdminSupportChat[];
  isLoading: boolean;
  isError: boolean;
  onSelect: (userId: string) => void;
}

const formatDate = (value: string | null): string =>
  value ? formatDisplay(value.slice(0, 10)) : '—';

export const ChatList = ({ chats, isLoading, isError, onSelect }: ChatListProps) => {
  if (isLoading) {
    return (
      <div className={commonStyles.loaderContainer}>
        <VLoader size={28} />
      </div>
    );
  }

  if (isError) {
    return <div className={commonStyles.textSecondary}>Не удалось загрузить обращения</div>;
  }

  if (chats.length === 0) {
    return <div className={commonStyles.textSecondary}>Обращений пока нет</div>;
  }

  return (
    <div className={styles.list}>
      {chats.map((chat, index) => (
        <div
          key={chat.user_id}
          className={commonStyles.animateCard}
          style={{ animationDelay: `${index * 0.03}s` }}
        >
          <VCard
            interactive
            className={styles.card}
            onClick={() => onSelect(chat.user_id)}
          >
            <div className={styles.cardHeader}>
              <span className={styles.email}>{chat.email}</span>
              <VBadge variant={chat.isOpen ? 'warning' : 'neutral'}>
                {chat.isOpen ? 'Открыта' : 'Закрыта'}
              </VBadge>
              {chat.unreadCount > 0 && <VBadge variant="danger">{chat.unreadCount}</VBadge>}
            </div>
            <div className={styles.lastText}>{chat.lastText ?? 'Нет сообщений'}</div>
            <div className={styles.lastAt}>{formatDate(chat.lastAt)}</div>
          </VCard>
        </div>
      ))}
    </div>
  );
};