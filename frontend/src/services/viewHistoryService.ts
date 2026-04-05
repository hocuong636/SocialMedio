import api from '../api/axiosConfig'
import type { ViewHistory, PaginatedResponse } from '../types'

export const viewHistoryService = {
  async recordView(postId: string): Promise<ViewHistory> {
    const res = await api.post('/view-histories', { postId })
    return res.data as ViewHistory
  },

  async getHistory(page = 1, limit = 10): Promise<PaginatedResponse<ViewHistory>> {
    const res = await api.get('/view-histories', { params: { page, limit } })
    return res.data as PaginatedResponse<ViewHistory>
  },

  async deleteOne(id: string): Promise<void> {
    await api.delete(`/view-histories/${id}`)
  },

  async deleteAll(): Promise<void> {
    await api.delete('/view-histories')
  },
}
