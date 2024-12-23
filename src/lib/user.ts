import api from './api'

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
  city: { id: number, name: string, state: string, country: string }
  isActive: boolean
}

export interface UserDetailResponse {
  userProfile: UserProfile
  contactNumbers: ContactNumber[]
  socialMediaAccounts: SocialMediaAccount[]
  websites: Website[]
  media: MediaItem[]
  locations: LocationItem[]
}

export async function getUserDetails(): Promise<UserDetailResponse> {
  const { data } = await api.get('/api/v1/users/user-detail')
  return data
}
