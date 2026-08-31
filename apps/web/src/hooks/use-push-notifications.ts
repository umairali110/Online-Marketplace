'use client';

import { useCallback, useState } from 'react';
import { api } from '@/lib/api-client';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const [subscribing, setSubscribing] = useState(false);

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return { ok: false, reason: 'Push notifications are not supported in this browser.' };
    }
    setSubscribing(true);
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return { ok: false, reason: 'Notification permission denied.' };

      const { data } = await api.get('/push/vapid-public-key');
      if (!data.key) return { ok: false, reason: 'Push notifications are not configured on the server yet.' };

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.key),
      });

      await api.post('/push/subscribe', subscription.toJSON());
      return { ok: true };
    } finally {
      setSubscribing(false);
    }
  }, []);

  return { subscribe, subscribing };
}