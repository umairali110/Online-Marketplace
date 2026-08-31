'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { notificationPrefsApi, NotificationPrefs } from '@/lib/notification-prefs-api';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';

const labels: Record<keyof NotificationPrefs, string> = {
  emailNewOrder: 'New order emails',
  emailLowStock: 'Low stock alerts',
  emailJobUpdates: 'Job/application updates',
  emailBackInStock: 'Back-in-stock alerts',
  emailAbandonedCart: 'Cart reminder emails',
};

export function NotificationSettings() {
  const queryClient = useQueryClient();
  const { show } = useToast();
  const { subscribe, subscribing } = usePushNotifications();
  const { data: prefs } = useQuery({ queryKey: ['notification-prefs'], queryFn: notificationPrefsApi.get });
  const [pushEnabled, setPushEnabled] = useState(false);

  const handleToggle = async (key: keyof NotificationPrefs) => {
    if (!prefs) return;
    const updated = await notificationPrefsApi.update({ [key]: !prefs[key] });
    queryClient.setQueryData(['notification-prefs'], updated);
  };

  const handleEnablePush = async () => {
    const result = await subscribe();
    if (result.ok) {
      setPushEnabled(true);
      show('Push notifications enabled');
    } else {
      show(result.reason ?? 'Could not enable push notifications', 'error');
    }
  };

  if (!prefs) return null;

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <h2 className="mb-3 text-sm font-bold text-text-primary">Notification Settings</h2>

      <div className="mb-4 flex items-center justify-between rounded-btn border border-border bg-bg p-3">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-primary" />
          <span className="text-sm text-text-primary">Browser push notifications</span>
        </div>
        <Button size="sm" variant={pushEnabled ? 'outline' : 'primary'} loading={subscribing} onClick={handleEnablePush}>
          {pushEnabled ? 'Enabled' : 'Enable'}
        </Button>
      </div>

      <div className="space-y-3">
        {(Object.keys(labels) as (keyof NotificationPrefs)[]).map((key) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-text-primary">{labels[key]}</span>
            <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
              <input type="checkbox" checked={prefs[key]} onChange={() => handleToggle(key)} className="peer sr-only" />
              <div className="h-6 w-11 rounded-full bg-border peer-checked:bg-primary" />
              <div className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}