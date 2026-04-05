import api from '../api/axiosConfig'
import type { Comment } from '../types'

export interface PaginatedComments {
  success: boolean
  data: (Comment & { repliesCount?: number })[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface PaginatedReplies {
  success: boolean
  data: Comment[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const commentService = {
  /**
   * Lấy danh sách comments của 1 bài viết
   * @param postId - ID của bài viết
   * @param page - Trang thứ mấy (bắt đầu từ 1)
   * @param limit - Số comments trên 1 trang (default 10)
   */
  async getCommentsByPost(
    postId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedComments> {
    const res = await api.get(`/comments/post/${postId}`, {
      params: { page, limit },
    })
    return res.data
  },

  /**
   * Lấy replies (bình luận con) của 1 bình luận
   * @param commentId - ID của comment cha
   * @param page - Trang thứ mấy (bắt đầu từ 1)
   * @param limit - Số replies trên 1 trang (default 5)
   */
  async getReplies(
    commentId: string,
    page = 1,
    limit = 5,
  ): Promise<PaginatedReplies> {
    const res = await api.get(`/comments/${commentId}/replies`, {
      params: { page, limit },
    })
    return res.data
  },

  /**
   * Tạo bình luận mới (comment hoặc reply)
   * @param postId - ID của bài viết
   * @param content - Nội dung bình luận
   * @param parentCommentId - ID của comment cha (nếu là reply)
   */
  async createComment(
    postId: string,
    content: string,
    parentCommentId?: string,
  ): Promise<{ success: boolean; data: Comment; message: string }> {
    const res = await api.post('/comments', {
      post: postId,
      content,
      parentComment: parentCommentId || null,
    })
    return res.data
  },

  /**
   * Cập nhật nội dung bình luận
   * @param commentId - ID của comment
   * @param content - Nội dung mới
   */
  async updateComment(
    commentId: string,
    content: string,
  ): Promise<{ success: boolean; data: Comment; message: string }> {
    const res = await api.patch(`/comments/${commentId}`, { content })
    return res.data
  },

  /**
   * Xóa bình luận
   * @param commentId - ID của comment
   */
  async deleteComment(
    commentId: string,
  ): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/comments/${commentId}`)
    return res.data
  },
}
