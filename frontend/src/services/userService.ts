import api from '../api/axiosConfig'
import type { User, UserProfile } from '../types'

export interface UpdateUserInfoPayload {
  fullName?: string
  bio?: string
}

export interface UpdateProfilePayload {
  phone?: string
  dateOfBirth?: string | null
  gender?: 'male' | 'female' | 'other' | ''
  address?: string
  website?: string
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const res = await api.get('/users/profile')
    return res.data as UserProfile
  },

  async getUserByUsername(username: string): Promise<User> {
    const res = await api.get(`/users/by-username/${encodeURIComponent(username)}`)
    return res.data as User
  },

  async updateInfo(data: UpdateUserInfoPayload): Promise<User> {
    const res = await api.put('/users/info', data)
    return res.data as User
  },

  async updateProfile(data: UpdateProfilePayload): Promise<UserProfile> {
    const res = await api.put('/users/profile', data)
    return res.data as UserProfile
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data as User
  },

  async uploadCover(file: File): Promise<User> {
    const formData = new FormData()
    formData.append('cover', file)
    const res = await api.post('/upload/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data as User
  },
}
