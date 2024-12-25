// src/lib/conversations.ts

import api from '@/lib/api'

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

/** 1) Get all conversation threads */
export async function getConversations(): Promise<Conversation[]> {
  const { data } = await api.get('/api/v1/conversations')
  return data
}

/** 2) Get messages for a specific conversation (with pagination) */
export async function getMessages(
  matchId: string,
  page = 1,
  size = 20
): Promise<Message[]> {
  const { data } = await api.get(`/api/v1/conversations/${matchId}/messages`, {
    params: { page, size },
  })
  return data
}

/** 3) Send new message via REST (POST) */
export async function sendMessageREST(matchId: string, content: string): Promise<Message> {
  const { data } = await api.post(`/api/v1/conversations/${matchId}/messages`, {
    content,
  })
  return data
}
