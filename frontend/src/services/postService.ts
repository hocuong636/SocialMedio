import api from '../api/axiosConfig'
import type { Post, PaginatedResponse } from '../types'

export const postService = {
  async getFeed(page = 1, limit = 10): Promise<PaginatedResponse<Post>> {
    const res = await api.get('/posts', { params: { page, limit } })
    return res.data as PaginatedResponse<Post>
  },

  async createPost(
    content: string,
    visibility: 'public' | 'friends' | 'private' = 'public',
    images: string[] = [],
  ): Promise<Post> {
    const res = await api.post('/posts', { content, visibility, images })
    return res.data.data as Post
  },

  async updatePost(
    id: string,
    data: { content?: string; visibility?: string; images?: string[] },
  ): Promise<Post> {
    const res = await api.put(`/posts/${id}`, data)
    return res.data.data as Post
  },

  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`)
  },

  async getPost(id: string): Promise<Post> {
    const res = await api.get(`/posts/${id}`)
    return res.data as Post
  },

  async getUserPosts(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Post>> {
    const res = await api.get(`/posts/user/${userId}`, {
      params: { page, limit },
    })
    return res.data as PaginatedResponse<Post>
  },
}
