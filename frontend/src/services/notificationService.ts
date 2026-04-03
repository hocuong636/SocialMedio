import api from '../api/axiosConfig'
import type { Notification, PaginatedResponse } from '../types'

export const notificationService = {
  async getNotifications(
    page = 1,
    limit = 15,
  ): Promise<PaginatedResponse<Notification>> {
    const res = await api.get('/notifications', { params: { page, limit } })
    return res.data as PaginatedResponse<Notification>
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all')
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`)
  },
}
