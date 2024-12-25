// src/lib/conversations.ts

import api from '@/lib/api'

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}
export interface Conversation {
  matchId: string
  userId: string
  name: string
  bio: string
  matchedAt: string
  recentMessages: Message[]
}

export interface Message {
  id: string
  fromUserId: string
  toUserId: string
  content: string
  createdAt: string
}

/** Returns a *paginated* list of conversations. */
export async function getConversations(
  page = 0,
  size = 20
): Promise<PaginatedResponse<Conversation>> {
  const { data } = await api.get('/api/v1/conversations', {
    params: { page, size },
  })
  return data
}

/** Returns a *paginated* list of messages for a specific conversation. */
export async function getMessages(
  matchId: string,
  page = 0,
  size = 20
): Promise<PaginatedResponse<Message>> {
  const { data } = await api.get(`/api/v1/conversations/${matchId}/messages`, {
    params: { page, size },
  })
  return data
}

/** Sends a new message (unchanged). */
export async function sendMessageREST(
  matchId: string,
  content: string
): Promise<Message> {
  const { data } = await api.post(`/api/v1/conversations/${matchId}/messages`, {
    content,
  })
  return data
}