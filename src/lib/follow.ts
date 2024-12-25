// src/lib/follow.ts
import api from '@/lib/api'

export async function getFollowPrice(cityId: number): Promise<number> {
  // GET /api/v1/prices?cityId=14&subscriptionType=FOLLOW
  const { data } = await api.get('/api/v1/prices', {
    params: {
      cityId,
      subscriptionType: 'FOLLOW'
    }
  })
  // Example response => { type: "FOLLOW", price: 500.00 }
  return data.price
}

export interface FollowResponse {
  followId: string
  followedUser: { id: string; username: string }
  startDate: string
  endDate: string
  isActive: boolean
}

export async function followUser(followedUsername: string): Promise<FollowResponse> {
  // POST /api/v1/follows
  // Request body:
  // {
  //   "followedUsername": "<username>"
  // }
  const payload = { followedUsername }
  const { data } = await api.post('/api/v1/follows', payload)
  return data
}
