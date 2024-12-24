// src/lib/swipeService.ts

import api from '@/lib/api'
import qs from 'qs'

export interface OptionItem {
  id: number
  name: string
}

export interface SwipeCardUser {
  userId: string
  name: string
  bio: string
  age: number
  distance: number
  // ...any other fields
}

/** 1) Fetch Genders */
export async function fetchGenders(): Promise<OptionItem[]> {
  const { data } = await api.get('/api/v1/options/genders')
  return data
}

/** 2) Fetch Orientations */
export async function fetchOrientations(): Promise<OptionItem[]> {
  const { data } = await api.get('/api/v1/options/orientations')
  return data
}

/** 3) Fetch Swipable Users with correct repeat params for arrays */
export async function fetchSwipableUsers(params: {
  distancePreference?: number
  ageMin?: number
  ageMax?: number
  genderIds?: number[]
  orientationIds?: number[]
  page?: number
  size?: number
}): Promise<SwipeCardUser[]> {
  const { data } = await api.get('/api/v1/swipes', {
    params,
    paramsSerializer: (p) => qs.stringify(p, { arrayFormat: 'repeat' }),
  })
  return data
}

/** 4) Record Swipe */
export async function recordSwipe(action: 'LIKE' | 'DISLIKE', toUserId: string): Promise<any> {
  const payload = { action, toUserId }
  const { data } = await api.post('/api/v1/swipes', payload)
  return data
}
