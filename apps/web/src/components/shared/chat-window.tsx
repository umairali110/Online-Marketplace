'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useChatThread } from '@/hooks/use-chat-thread';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';

export function ChatWindow({ threadId, otherUserName }: { threadId: string; otherUserName: string }) {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useChatThread(threadId);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      await sendMessage(input);
      setInput('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[560px] flex-col rounded-card border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <p className="font-medium text-text-primary">{otherUserName}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading && <p className="text-sm text-text-muted">Loading conversation...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-center text-sm text-text-muted">Say hello — start the conversation.</p>
        )}
        {messages.map((m) => {
          const isMine = m.senderId === user?.id;
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : ''}`}>
              <div
                className={`max-w-[75%] rounded-btn px-3 py-2 text-sm ${
                  isMine ? 'bg-primary text-white' : 'bg-bg text-text-primary'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="h-10 flex-1 rounded-btn border border-border bg-bg px-3 text-sm focus:border-primary focus:outline-none"
        />
        <Button type="submit" size="sm" loading={sending}>
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
}