import api from '../api/axiosConfig'
import type { Reaction } from '../types'

export interface ReactionSummary {
  like: number
  haha: number
  love: number
  wow: number
  sad: number
  angry: number
  userReaction: string | null
}

export interface PaginatedReactions {
  success: boolean
  data: Reaction[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const reactionService = {
  /**
   * Thêm hoặc cập nhật reaction (one user, one reaction per post)
   * Nếu user đã có reaction và click cùng type => delete
   * Nếu user đã có reaction và click khác type => update
   * Nếu user chưa có reaction => create
   *
   * @param postId - ID của bài viết
   * @param type - Loại reaction (like, haha, love, wow, sad, angry)
   */
  async addOrUpdateReaction(
    postId: string,
    type: 'like' | 'haha' | 'love' | 'wow' | 'sad' | 'angry',
  ): Promise<{
    success: boolean
    data: Reaction | null
    message: string
  }> {
    const res = await api.post('/reactions', {
      post: postId,
      type,
    })
    return res.data
  },

  /**
   * Lấy danh sách reactions của 1 bài viết (có phân trang)
   * @param postId - ID của bài viết
   * @param page - Trang thứ mấy (bắt đầu từ 1)
   * @param limit - Số reactions trên 1 trang (default 20)
   */
  async getReactionsByPost(
    postId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedReactions> {
    const res = await api.get(`/reactions/post/${postId}`, {
      params: { page, limit },
    })
    return res.data
  },

  /**
   * Lấy thống kê reactions của 1 bài viết + reaction của current user (nếu có)
   * @param postId - ID của bài viết
   * @returns Thống kê: { like: 10, haha: 2, love: 5, ..., userReaction: 'like' }
   */
  async getReactionSummary(
    postId: string,
  ): Promise<{ success: boolean; data: ReactionSummary }> {
    const res = await api.get(`/reactions/${postId}/summary`)
    return res.data
  },

  /**
   * Xóa reaction của user
   * @param reactionId - ID của reaction
   */
  async deleteReaction(
    reactionId: string,
  ): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/reactions/${reactionId}`)
    return res.data
  },
}
