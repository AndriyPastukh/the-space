import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api';

export interface ChatParticipantProfile {
  id: number;
  firstName: string;
  lastName: string;
  nickname: string;
  avatarUrl: string;
}

export interface ChatItem {
  id: number;
  type: string;
  updatedAt: string;
  otherParticipant: ChatParticipantProfile | null;
  lastMessage: {
    id: number;
    content: string;
    createdAt: string;
  } | null;
  unreadCount: number;
}

export interface Message {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  isMine: boolean;
}

export const useChats = () => {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [isChatsLoading, setIsChatsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const pollIntervalRef = useRef<any>(null);

  const fetchChats = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsChatsLoading(true);
      const { data } = await api.get<ChatItem[]>('/api/chats');
      setChats(data);
      setChatsError(null);
    } catch (err: any) {
      setChatsError(err.response?.data?.message || 'Failed to load chats');
    } finally {
      if (showLoading) setIsChatsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (chatId: number, showLoading = false) => {
    try {
      if (showLoading) setIsMessagesLoading(true);
      const { data } = await api.get<Message[]>(`/api/chats/${chatId}/messages`);
      setMessages(data);
      setMessagesError(null);
    } catch (err: any) {
      setMessagesError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      if (showLoading) setIsMessagesLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (chatId: number) => {
    try {
      await api.patch(`/api/chats/${chatId}/read`);
      // Update unread count locally in list
      setChats((prevChats) =>
        prevChats.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error('Failed to mark chat as read:', err);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!selectedChatId || !content.trim()) return;

    try {
      setIsSending(true);
      const { data } = await api.post<Message>(`/api/chats/${selectedChatId}/messages`, {
        content,
      });
      // Append the sent message locally
      setMessages((prev) => [...prev, data]);
      // Instantly trigger chats refresh to update last message
      fetchChats();
    } catch (err: any) {
      setMessagesError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [selectedChatId, fetchChats]);

  // Initial load of chats
  useEffect(() => {
    fetchChats(true);
  }, [fetchChats]);

  // Load messages and mark as read when active chat changes
  useEffect(() => {
    if (selectedChatId !== null) {
      fetchMessages(selectedChatId, true);
      markAsRead(selectedChatId);
    } else {
      setMessages([]);
    }
  }, [selectedChatId, fetchMessages, markAsRead]);

  // Set up short-polling for new chats and messages every 3 seconds
  useEffect(() => {
    pollIntervalRef.current = setInterval(() => {
      fetchChats();
      if (selectedChatId !== null) {
        fetchMessages(selectedChatId);
      }
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedChatId, fetchChats, fetchMessages]);

  return {
    chats,
    messages,
    selectedChatId,
    setSelectedChatId,
    isChatsLoading,
    isMessagesLoading,
    chatsError,
    messagesError,
    isSending,
    sendMessage,
    fetchChats,
  };
};
