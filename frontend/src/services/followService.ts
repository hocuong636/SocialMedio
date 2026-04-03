import api from '../api/axiosConfig'
import type { Follow, PaginatedResponse } from '../types'

export const followService = {
  async follow(userId: string): Promise<Follow> {
    const res = await api.post(`/follows/${userId}`)
    return res.data as Follow
  },

  async unfollow(userId: string): Promise<void> {
    await api.delete(`/follows/${userId}`)
  },

  async getFollowing(
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Follow>> {
    const res = await api.get('/follows/following', { params: { page, limit } })
    return res.data as PaginatedResponse<Follow>
  },

  async getFollowers(
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Follow>> {
    const res = await api.get('/follows/followers', { params: { page, limit } })
    return res.data as PaginatedResponse<Follow>
  },

  async checkFollowing(userId: string): Promise<boolean> {
    const res = await api.get(`/follows/check/${userId}`)
    return (res.data as { isFollowing: boolean }).isFollowing
  },

  async getUserFollowing(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Follow>> {
    const res = await api.get(`/follows/${userId}/following`, {
      params: { page, limit },
    })
    return res.data as PaginatedResponse<Follow>
  },

  async getUserFollowers(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Follow>> {
    const res = await api.get(`/follows/${userId}/followers`, {
      params: { page, limit },
    })
    return res.data as PaginatedResponse<Follow>
  },
}
