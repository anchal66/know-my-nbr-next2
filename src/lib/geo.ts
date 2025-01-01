// src/lib/geo.ts

export async function getUserCountryCode(): Promise<string> {
  try {
    const response = await fetch('https://ipapi.co/json/')
    if (!response.ok) {
      throw new Error('Failed to fetch IP-based country')
    }
    const data = await response.json()
    // ipapi.co returns a 'country_code' like 'US', 'IN', etc.
    return data.country_code?.toLowerCase() || 'us' // fallback
  } catch (error) {
    // In case of error, just default to 'us'
    return 'us'
  }
}

/**
 * Fetches lat/lng from ipapi.co/json (which also provides city, region, etc.)
 * You can expand or customize as needed.
 */
export async function getIpLocation(): Promise<{ lat: number; lng: number }> {
  try {
    const response = await fetch('https://ipapi.co/json/')
    if (!response.ok) {
      throw new Error('Failed to fetch IP-based location')
    }
    const data = await response.json()
    return {
      lat: data.latitude,
      lng: data.longitude
    }
  } catch (error) {
    console.error('Error in getIpLocation:', error)
    throw error
  }
}

