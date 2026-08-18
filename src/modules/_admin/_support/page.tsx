import { useState } from 'react';
import commonStyles from '@/shared/styles/common.module.css';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import { useAdminSupportChats } from './api/useAdminSupportChats';
import { ChatDetail } from './components/ChatDetail';
import { ChatList } from './components/ChatList';

export const Page: React.FC = () => {
  const chatsQuery = useAdminSupportChats();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const chats = chatsQuery.data ?? [];
  const selected = chats.find((chat) => chat.user_id === selectedUserId) ?? null;

  if (selectedUserId && selected) {
    return (
      <div className={commonStyles.page}>
        <ChatDetail
          userId={selected.user_id}
          email={selected.email}
          onBack={() => setSelectedUserId(null)}
        />
      </div>
    );
  }

  return (
    <div className={commonStyles.page}>
      <VPageHeader title="Обращения" />
      <ChatList
        chats={chats}
        isLoading={chatsQuery.isLoading}
        isError={chatsQuery.isError}
        onSelect={setSelectedUserId}
      />
    </div>
  );
};