'use client';

import { useState } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { aiApi } from '@/lib/ai-api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const suggestedTasks = [
  'Answer customer questions',
  'Suggest marketing ideas',
  'Manage inventory alerts',
  'Handle order follow-up',
];

export default function AiEmployeePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const { reply } = await aiApi.employeeReply(text);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong, please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
      <div>
        <h1 className="mb-1 text-xl font-bold text-text-primary">AI Employee</h1>
        <p className="mb-4 text-sm text-text-muted">Your 24/7 AI assistant for your store.</p>
        <div className="rounded-card border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-bold text-text-primary">Tasks</h3>
          <ul className="space-y-1.5 text-sm text-text-muted">
            {suggestedTasks.map((task) => (
              <li key={task} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {task}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex h-[500px] flex-col rounded-card border border-border bg-surface">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="text-center text-sm text-text-muted">
              Ask your AI employee something — e.g. &quot;What products are low on stock?&quot;
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot size={16} />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-btn px-3 py-2 text-sm ${
                  m.role === 'user' ? 'bg-primary text-white' : 'bg-bg text-text-primary'
                }`}
              >
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg text-text-muted">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
          {loading && <p className="text-xs text-text-muted">AI employee is typing...</p>}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2 border-t border-border p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI Employee..."
            className="h-10 flex-1 rounded-btn border border-border bg-bg px-3 text-sm focus:border-primary focus:outline-none"
          />
          <Button type="submit" size="sm" loading={loading}>
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}