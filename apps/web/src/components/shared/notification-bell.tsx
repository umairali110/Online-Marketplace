'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/notifications-api';
import { useAuth } from '@/providers/auth-provider';

export function NotificationBell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
    enabled: !!user,
    refetchInterval: 15000,
  });

  const unreadCount = notifications?.filter((n) => !n.readAt).length ?? 0;

  const handleOpen = async () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) {
      await notificationsApi.markAllRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative text-text-primary">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 max-h-80 w-72 overflow-y-auto rounded-card border border-border bg-surface shadow-md">
          {(!notifications || notifications.length === 0) && (
            <p className="p-4 text-sm text-text-muted">No notifications yet.</p>
          )}
          {notifications?.map((n) => (
            <div key={n.id} className="border-b border-border p-3 text-sm last:border-b-0">
              <p className="font-medium text-text-primary">{n.title}</p>
              <p className="text-text-muted">{n.body}</p>
              <p className="mt-1 text-xs text-text-muted">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}