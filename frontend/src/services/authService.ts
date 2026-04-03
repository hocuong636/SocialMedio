import api from '../api/axiosConfig'
import type { User } from '../types'

export const authService = {
  /**
   * Login – backend sets TOKEN_SOCIAL_MEDIA cookie.
   * Returns JWT string; we immediately call getMe() to get the user object.
   */
  async login(username: string, password: string): Promise<void> {
    await api.post('/auth/login', { username, password })
  },

  async register(
    username: string,
    password: string,
    email: string,
  ): Promise<void> {
    await api.post('/auth/register', { username, password, email })
  },

  async getMe(): Promise<User> {
    const res = await api.get('/auth/me')
    return res.data as User
  },

  async changePassword(
    oldpassword: string,
    newpassword: string,
  ): Promise<void> {
    await api.post('/auth/changepassword', { oldpassword, newpassword })
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },
}
