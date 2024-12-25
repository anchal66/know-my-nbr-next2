// src/lib/nbrDirect.ts
import api from './api'

/** City user count interface */
export interface CityUserCount {
  cityId: number
  city: string
  state: string
  country: string
  userCount: number
}

/** Filter option item (id, name) */
export interface OptionItem {
  id: number
  name: string
}

/** For searching or listing users */
interface SearchResponse {
  total: number
  page: number
  size: number
  users: {
    userId: string
    username: string
    name: string
    age: number
    gender: { id: number; name: string }
    orientation: { id: number; name: string }
    media: {
      id: string
      type: string
      url: string
      orderNo: number
      isVerified: boolean
      isWatermarked: boolean
    }[]
    isVIP: boolean
    isFeatured: boolean
    nationality: { id: number; name: string }
  }[]
}

/** ========================= API calls ========================= */

export async function searchCitiesWithCounts(
  searchTerm: string,
  page = 0,
  size = 5
): Promise<any> {
  // GET /api/v1/users/locations/city/user-count?search=<term>&page=0&size=5
  const { data } = await api.get('/api/v1/users/locations/city/user-count', {
    params: {
      search: searchTerm,
      page,
      size,
    },
  })
  return data
}

/** 1. Fetch city user counts */
export async function getCityUserCounts(): Promise<CityUserCount[]> {
  const { data } = await api.get('/api/v1/users/locations/city/user-count')
  return data
}

/** 2. Fetch various option endpoints */
export async function getGenders(): Promise<OptionItem[]> {
  const { data } = await api.get('/api/v1/options/genders')
  return data
}

export async function getOrientations(): Promise<OptionItem[]> {
  const { data } = await api.get('/api/v1/options/orientations')
  return data
}

export async function getHairColors(): Promise<OptionItem[]> {
  const { data } = await api.get('/api/v1/options/hair-colors')
  return data
}

export async function getNationalities(): Promise<OptionItem[]> {
  const { data } = await api.get('/api/v1/options/nationalities')
  return data
}

export async function getEthnicities(): Promise<OptionItem[]> {
  const { data } = await api.get('/api/v1/options/ethnicities')
  return data
}

// (If needed) e.g. getLanguages, etc.

/** 3. Search users based on cityId & filters */
interface SearchParams {
  cityId: number
  name?: string
  genderIds?: number[]
  hairColorIds?: number[]
  orientationIds?: number[]
  nationalityIds?: number[]
  ageMin?: number
  ageMax?: number
  sortBy?: string
  page?: number
  size?: number
}

export async function searchUsers(params: SearchParams): Promise<SearchResponse> {
  const {
    cityId,
    name,
    genderIds,
    hairColorIds,
    orientationIds,
    nationalityIds,
    ageMin,
    ageMax,
    sortBy,
    page = 0,
    size = 20
  } = params

  const query = new URLSearchParams()
  query.set('cityId', String(cityId))
  if (name) query.set('name', name)
  if (genderIds && genderIds.length > 0) {
    genderIds.forEach(g => query.append('genderIds', String(g)))
  }
  if (hairColorIds && hairColorIds.length > 0) {
    hairColorIds.forEach(h => query.append('hairColorIds', String(h)))
  }
  if (orientationIds && orientationIds.length > 0) {
    orientationIds.forEach(o => query.append('orientationIds', String(o)))
  }
  if (nationalityIds && nationalityIds.length > 0) {
    nationalityIds.forEach(n => query.append('nationalityIds', String(n)))
  }
  if (ageMin !== undefined) query.set('ageMin', String(ageMin))
  if (ageMax !== undefined) query.set('ageMax', String(ageMax))
  if (sortBy) query.set('sortBy', sortBy)
  query.set('page', String(page))
  query.set('size', String(size))

  const { data } = await api.get(`/api/v1/users?${query.toString()}`)
  return data
}
