// src/lib/geo.ts
export async function getUserCountryCode(): Promise<string> {
    try {
      const response = await fetch('https://ipapi.co/json/')
      if (!response.ok) {
        throw new Error('Failed to fetch IP-based country')
      }
      const data = await response.json()
      // ipapi.co returns a 'country_code' like 'US', 'IN', etc.
      return data.country_code?.toLowerCase() || 'us'  // fallback
    } catch (error) {
      // In case of error, just default to 'us'
      return 'us'
    }
  }
  