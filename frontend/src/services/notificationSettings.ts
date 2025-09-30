import { http } from './http';

export interface NotificationSettings {
  id: number;
  user_id: number;
  email_enabled: boolean;
  email_from?: string;
  email_server?: string;
  email_port?: number;
  email_username?: string;
  email_password?: string;
  email_use_tls: boolean;
  whatsapp_enabled: boolean;
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_phone_number?: string;
  sms_enabled: boolean;
}

export const notificationSettingsService = {
  // Get current user's notification settings
  getMySettings: async () => {
    const { data } = await http.get<NotificationSettings>('/notification-settings/me/');
    return data;
  },

  // Update current user's notification settings
  updateMySettings: async (settings: Partial<NotificationSettings>) => {
    const { data } = await http.put<NotificationSettings>('/notification-settings/me/', settings);
    return data;
  },

  // Admin: Get notification settings for a specific user
  getUserSettings: async (userId: number) => {
    const { data } = await http.get<NotificationSettings>(`/notification-settings/user/${userId}`);
    return data;
  },
};
