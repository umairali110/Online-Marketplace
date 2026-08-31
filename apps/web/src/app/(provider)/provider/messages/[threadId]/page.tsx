'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/lib/chat-api';
import { ChatWindow } from '@/components/shared/chat-window';

export default function ProviderMessageThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const { data: threads } = useQuery({ queryKey: ['chat-threads'], queryFn: chatApi.listMine });
  const thread = threads?.find((t) => t.id === threadId);

  return <ChatWindow threadId={threadId} otherUserName={thread?.otherUser.name ?? 'Conversation'} />;
}