import api from '../api/axiosConfig'
import type { SavedPost, PaginatedResponse } from '../types'

export const savedPostService = {
  async getSaved(page = 1, limit = 10): Promise<PaginatedResponse<SavedPost>> {
    const res = await api.get('/saved-posts', { params: { page, limit } })
    return res.data as PaginatedResponse<SavedPost>
  },

  async savePost(postId: string): Promise<SavedPost> {
    const res = await api.post('/saved-posts', { postId })
    return res.data.data as SavedPost
  },

  async unsavePost(postId: string): Promise<void> {
    await api.delete(`/saved-posts/${postId}`)
  },
}
