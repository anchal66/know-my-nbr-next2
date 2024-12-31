// src/lib/conversations.ts

import api from '@/lib/api'
import qs from 'qs'

// We can reuse the PaginatedResponse from swipeService or re-declare:
export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface Message {
  id: string
  content: string
  fromUserId?: string
  // add whatever else is in your backend
}

export interface MediaItem {
  id: string
  type: 'IMAGE' | 'VIDEO'
  url: string
  isVerified: boolean
  isWatermarked: boolean
  orderNo: number
}

export interface Conversation {
  matchId: string
  name: string
  media?: MediaItem[]
  recentMessages?: Message[],
  userId: string,
  bio: string
}

/**
 * 1) Fetch all conversations
 * Example endpoint: GET /api/v1/conversations?page=x&size=y
 */
export async function getConversations(
  page: number,
  size: number
): Promise<PaginatedResponse<Conversation>> {
  const { data } = await api.get('/api/v1/conversations', {
    params: { page, size },
    paramsSerializer: (p) => qs.stringify(p, { arrayFormat: 'repeat' }),
  })
  return data
}

/**
 * 2) Fetch messages for a given conversation
 * Example endpoint: GET /api/v1/conversations/{matchId}/messages?page=x&size=y
 */
export async function getMessages(
  matchId: string,
  page: number,
  size: number
): Promise<PaginatedResponse<Message>> {
  const { data } = await api.get(`/api/v1/conversations/${matchId}/messages`, {
    params: { page, size },
    paramsSerializer: (p) => qs.stringify(p, { arrayFormat: 'repeat' }),
  })
  return data
}

/**
 * 3) Send a message to a conversation
 * Example endpoint: POST /api/v1/conversations/{matchId}/messages
 */
export async function sendMessageREST(
  matchId: string,
  content: string
): Promise<Message> {
  const payload = { content }
  const { data } = await api.post(`/api/v1/conversations/${matchId}/messages`, payload)
  return data
}
