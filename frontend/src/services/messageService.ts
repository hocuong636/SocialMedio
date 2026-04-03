import api from '../api/axiosConfig'
import type { Conversation, Message, PaginatedResponse } from '../types'

export const messageService = {
  async getConversations(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Conversation>> {
    const res = await api.get('/conversations', { params: { page, limit } })
    return res.data as PaginatedResponse<Conversation>
  },

  async getOrCreateConversation(userId: string): Promise<Conversation> {
    const res = await api.post('/conversations', { userId })
    return res.data as Conversation
  },

  async getMessages(
    conversationId: string,
    page = 1,
    limit = 30,
  ): Promise<PaginatedResponse<Message>> {
    const res = await api.get(`/messages/${conversationId}`, {
      params: { page, limit },
    })
    return res.data as PaginatedResponse<Message>
  },

  async sendMessage(
    conversationId: string,
    text: string,
    type: 'text' | 'image' | 'file' = 'text',
  ): Promise<Message> {
    const res = await api.post('/messages', {
      conversationId,
      messageContent: { type, text },
    })
    return res.data as Message
  },
}
