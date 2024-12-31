// src/lib/follow.ts
import api from '@/lib/api'

export async function getFollowPrice(cityId: string): Promise<number> {
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

// Optional interface if the API returns a paginated structure similar to Spring data.
export interface PaginatedFollowers {
  content: FollowResponse[]
  // You can include the other fields if your backend response includes them
  totalElements: number
  totalPages: number
  size: number
  number: number
  last: boolean
  first: boolean
  // etc. 
}

/**
 * Fetch the list of followers who follow the *current user*, filtered by active/inactive.
 * This calls: GET /api/v1/follows/followers?page=${page}&size=${size}&active=${active}
 */
export async function getFollowers(
  page: number,
  size: number,
  active: boolean
): Promise<PaginatedFollowers> {
  const { data } = await api.get('/api/v1/follows/followers', {
    params: { page, size, active },
  })
  return data
}

/**
 * Fetch the list of followers who follow the *current user*, filtered by active/inactive.
 * This calls: GET /api/v1/follows?page=${page}&size=${size}&active=${active}
 */
export async function getFollows(
  page: number,
  size: number,
  active: boolean
): Promise<PaginatedFollowers> {
  const { data } = await api.get('/api/v1/follows', {
    params: { page, size, active },
  })
  return data
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
