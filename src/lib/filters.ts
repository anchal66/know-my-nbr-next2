// src/lib/filters.ts

import Cookies from 'js-cookie'

export interface SwipeFilters {
  distancePreference: number
  ageMin: number
  ageMax: number
  genderIds: number[] // can be multiple
  orientationIds: number[]
}

/** Cookie key for the filters */
const FILTER_COOKIE_KEY = 'swipe_filters'

/** Default filters if none found in cookie */
export const defaultFilters: SwipeFilters = {
  distancePreference: 50, // e.g., 50 km
  ageMin: 18,
  ageMax: 30,
  genderIds: [],
  orientationIds: [],
}

/** Load existing filters from cookie, or return default */
export function loadFilters(): SwipeFilters {
  try {
    const cookieValue = Cookies.get(FILTER_COOKIE_KEY)
    if (!cookieValue) return defaultFilters
    return JSON.parse(cookieValue) as SwipeFilters
  } catch {
    return defaultFilters
  }
}

/** Save filters to cookie */
export function saveFilters(filters: SwipeFilters) {
  Cookies.set(FILTER_COOKIE_KEY, JSON.stringify(filters), { expires: 7 }) // 7 days
}
