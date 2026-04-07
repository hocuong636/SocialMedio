import api from '../api/axiosConfig'
import type { Report } from '../types'

export const reportService = {
  async createReport(data: {
    targetType: 'post' | 'comment' | 'user'
    targetId: string
    reason: string
  }): Promise<Report> {
    const res = await api.post('/reports', data)
    return res.data.data as Report
  },

  async getReports(): Promise<Report[]> {
    const res = await api.get('/reports')
    return res.data.data as Report[]
  },

  async updateReportStatus(
    id: string,
    status: 'pending' | 'resolved' | 'rejected',
  ): Promise<Report> {
    const res = await api.patch(`/reports/${id}/status`, { status })
    return res.data.data as Report
  },
}
