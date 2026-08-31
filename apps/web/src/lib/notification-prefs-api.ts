import { api } from './api-client';

export interface NotificationPrefs {
  emailNewOrder: boolean;
  emailLowStock: boolean;
  emailJobUpdates: boolean;
  emailBackInStock: boolean;
  emailAbandonedCart: boolean;
}

export const notificationPrefsApi = {
  get: () => api.get<NotificationPrefs>('/users/me/notification-preferences').then((r) => r.data),
  update: (prefs: Partial<NotificationPrefs>) =>
    api.patch<NotificationPrefs>('/users/me/notification-preferences', prefs).then((r) => r.data),
};