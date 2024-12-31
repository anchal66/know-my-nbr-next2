// src/lib/user.ts

import api from './api'
import { FollowResponse } from './follow'
import { Subscription } from './subscription'

export interface UserProfile {
  id: string
  username: string
  name: string
  bio: string
  dateOfBirth: string
  gender: { id: number, name: string }
  orientation: { id: number, name: string }
  ethnicity: { id: number, name: string }
  heightCm: number
  hairColor: { id: number, name: string }
  nationality: { id: number, name: string }
  languages: { id: number, name: string }[]
  isCurrentUser: boolean
}

export interface ContactNumber {
  id: string
  number: string
  fullNumber: string
  countryCode: string
  apps: { id: number, name: string }[]
  isPrivate: boolean
}

export interface SocialMediaAccount {
  id: string
  platform: { id: number, name: string }
  url: string
  isPrivate: boolean
}

export interface Website {
  id: string
  url: string
  isPrivate: boolean
}

export interface MediaItem {
  id: string
  type: string
  url: string
  isVerified: boolean
  isWatermarked: boolean
  orderNo: number
}

export interface LocationItem {
  id: string
  placeId: string
  latitude: number
  longitude: number
  name: string
  city: { id: string, name: string, state: string, country: string }
  isActive: boolean
}

export interface UserDetailResponse {
  userProfile: UserProfile
  contactNumbers: ContactNumber[]
  socialMediaAccounts: SocialMediaAccount[]
  websites: Website[]
  media: MediaItem[]
  locations: LocationItem[]
  followers: FollowResponse[]
  follows: FollowResponse[]
  subscriptionType: Subscription
  matchesCount: number
  heartReceivedCount: number
  commentsCount: number
  activeCityId: string
}

export async function getUserDetails(): Promise<UserDetailResponse> {
  const { data } = await api.get('/api/v1/users/user-detail')
  return data
}

/**
 * New function to change user location in the backend.
 * Returns the updated location item from the server.
 */
export async function changeUserLocation(params: {
  id: string
  placeId?: string
  isActive: boolean
}): Promise<LocationItem> {
  const { data } = await api.post('/api/v1/users/locations/change-location', params)
  return data
}
