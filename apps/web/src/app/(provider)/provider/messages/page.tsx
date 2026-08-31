'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/lib/chat-api';
import { avatarUrl } from '@/lib/user-api';

export default function ProviderMessagesPage() {
  const { data: threads, isLoading } = useQuery({ queryKey: ['chat-threads'], queryFn: chatApi.listMine });

  if (isLoading) return <p className="text-text-muted">Loading conversations...</p>;

  if (!threads || threads.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface p-8 text-center text-text-muted">
        No conversations yet.
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-text-primary">Messages</h1>
      <div className="divide-y divide-border rounded-card border border-border bg-surface">
        {threads.map((t) => {
          const avatar = avatarUrl(t.otherUser.avatar);
          return (
            <Link key={t.id} href={`/provider/messages/${t.id}`} className="flex items-center gap-3 p-4 hover:bg-bg">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-bg">
                {avatar ? (
                  <Image src={avatar} alt={t.otherUser.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-bold text-primary">
                    {t.otherUser.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary">{t.otherUser.name}</p>
                <p className="truncate text-sm text-text-muted">{t.lastMessage ?? 'No messages yet'}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}