'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { chatApi, ChatMessage } from '@/lib/chat-api';

export function useChatThread(threadId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatApi.listMessages(threadId).then((msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
  }, [threadId]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit('join-thread', { threadId });

    const handleMessage = (msg: ChatMessage) => {
      if (msg.threadId === threadId) setMessages((prev) => [...prev, msg]);
    };

    socket.on('chat:message', handleMessage);
    return () => {
      socket.off('chat:message', handleMessage);
    };
  }, [threadId]);

  const sendMessage = async (content: string) => {
    await chatApi.sendMessage(threadId, content);
    // No optimistic append here — the socket broadcast (including our own emit)
    // brings it back, so we never risk a duplicate bubble from a race.
  };

  return { messages, loading, sendMessage };
}