import { supabase } from '../supabase';
import type { Database } from '../types/database.types';
import { trimStrings } from '@/shared/utils';

export type SupportMessage = Database['public']['Tables']['support_messages']['Row'];
export type SupportChat = Database['public']['Tables']['support_chats']['Row'];

export interface SupportChatData {
  messages: SupportMessage[];
  isOpen: boolean;
  userReadAt: string | null;
  unreadCount: number;
  chatExists: boolean;
}

class SupportService {
  async getChatRow(userId: string): Promise<SupportChat | null> {
    const { data, error } = await supabase
      .from('support_chats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async getChat(userId: string): Promise<SupportChatData> {
    const [messagesResult, chatResult] = await Promise.all([
      supabase
        .from('support_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),
      supabase
        .from('support_chats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
    ]);
    if (messagesResult.error) throw messagesResult.error;
    if (chatResult.error) throw chatResult.error;

    const messages = messagesResult.data ?? [];
    const chat = chatResult.data;
    const userReadAt = chat?.user_read_at ?? null;
    const unreadCount = userReadAt
      ? messages.filter(
          (message) => message.author_role === 'admin' && message.created_at > userReadAt,
        ).length
      : messages.filter((message) => message.author_role === 'admin').length;

    return {
      messages,
      isOpen: chat?.is_open ?? false,
      userReadAt,
      unreadCount,
      chatExists: Boolean(chat),
    };
  }

  async getUnreadCount(userId: string, readAt: string | null): Promise<number> {
    let query = supabase
      .from('support_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('author_role', 'admin');
    if (readAt) {
      query = query.gt('created_at', readAt);
    }
    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  }

  async sendMessage(userId: string, text: string): Promise<SupportMessage> {
    const now = new Date().toISOString();
    const chat = await this.getChatRow(userId);

    if (!chat) {
      const { error: chatError } = await supabase
        .from('support_chats')
        .insert({ user_id: userId, is_open: true, updated_at: now });
      if (chatError) throw chatError;
    } else if (!chat.is_open) {
      const { error: openError } = await supabase
        .from('support_chats')
        .update({ is_open: true, updated_at: now })
        .eq('user_id', userId);
      if (openError) throw openError;
    }

    const { data, error } = await supabase
      .from('support_messages')
      .insert(trimStrings({ user_id: userId, author_role: 'user', text }))
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async markRead(userId: string): Promise<void> {
    const now = new Date().toISOString();
    const { data: lastMessage, error: messageError } = await supabase
      .from('support_messages')
      .select('created_at')
      .eq('user_id', userId)
      .eq('author_role', 'admin')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (messageError) throw messageError;

    const userReadAt =
      lastMessage && lastMessage.created_at > now ? lastMessage.created_at : now;

    const { error } = await supabase
      .from('support_chats')
      .update({ user_read_at: userReadAt, updated_at: now })
      .eq('user_id', userId);
    if (error) throw error;
  }
}

export const supportService = new SupportService();