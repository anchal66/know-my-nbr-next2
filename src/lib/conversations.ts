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

// REST: get all conversation threads
export async function getConversations(): Promise<Conversation[]> {
  const { data } = await api.get('/api/v1/conversations')
  return data
}

// REST: get messages for one conversation (pagination)
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

// Optional fallback: if you want to send messages via REST
export async function sendMessage(matchId: string, content: string): Promise<Message> {
  const { data } = await api.post(`/api/v1/conversations/${matchId}/messages`, { content })
  return data
}
