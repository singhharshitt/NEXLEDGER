import api from './api';

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface NotificationSettings {
  notify_challan: boolean;
  notify_stock: boolean;
  notify_customer: boolean;
}

export const notificationService = {
  async getNotifications(page = 1, limit = 20) {
    const { data } = await api.get('/notifications', { params: { page, limit } });
    return data.data;
  },

  async getUnreadCount() {
    const { data } = await api.get('/notifications/unread-count');
    return data.data.count as number;
  },

  async markAsRead(id: string) {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data.data;
  },

  async markAllAsRead() {
    const { data } = await api.patch('/notifications/read-all');
    return data.success;
  },

  async getSettings() {
    const { data } = await api.get('/notifications/settings');
    return data.data as NotificationSettings;
  },

  async updateSettings(settings: Partial<NotificationSettings>) {
    const { data } = await api.patch('/notifications/settings', settings);
    return data.data as NotificationSettings;
  }
};
