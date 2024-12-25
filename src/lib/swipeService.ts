// src/lib/swipeService.ts

import api from '@/lib/api'
import qs from 'qs'

export interface OptionItem {
  id: number
  name: string
}

export interface SwipeCardUser {
  id: string
  name: string
  bio: string
  dateOfBirth: string
  distance: number,
  gender: string,
  orientation: string,
  ethnicity: string,
  heightCm: string,
  hairColor: string
}

export function calculateAge(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // If birth month hasn't occurred yet this year, or it's the birth month but the day hasn't occurred yet, subtract one from age
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
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
