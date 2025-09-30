import { http } from './http'

export const notificationsService = {
  async send(payload: { event_id: number; channel: 'email'|'whatsapp'; recipient?: string; message: string }) {
    const { data } = await http.post<{
      ok: boolean;
      status: string;
      log_id?: number;
      log_ids?: number[];
      results?: { guest_id: number|null; guest_name: string|null; recipient: string; ok: boolean; status: string; log_id: number }[];
    }>(`/notifications/send`, payload)
    return data
  }
}
