// src/lib/otherUserProfile.ts
import api from './api'
import {
  UserProfile,
  ContactNumber,
  SocialMediaAccount,
  Website,
  MediaItem,
  LocationItem
} from '@/lib/user'

export interface OtherUserDetailResponse {
  userProfile: UserProfile
  contactNumbers: ContactNumber[]
  socialMediaAccounts: SocialMediaAccount[]
  websites: Website[]
  media: MediaItem[]
  locations: LocationItem[]
  matchesCount: number
  heartReceivedCount: number
  commentsCount: number
  followersCount: number
  followsCount: number
  isFollowed: boolean
  hasContactNumbers: boolean
  hasSocialMediaAccounts: boolean
  hasWebsites: boolean
}

/**
 * For fetching some-other-user's profile by userId or username.
 * E.g., GET /api/v1/users/{userId}/profile
 */
export async function getOtherUserProfileById(username: string): Promise<OtherUserDetailResponse> {
  const { data } = await api.get(`/api/v1/users/${username}/profile`)
  return data
}
