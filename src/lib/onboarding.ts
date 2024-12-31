// src/lib/onboarding.ts
import { AxiosProgressEvent } from 'axios'
import api from './api'

interface OnboardingProfileData {
    name: string
    bio: string
    dateOfBirth: string
    genderId: number
    orientationId: number
    ethnicityId: number
    heightCm: number
    hairColorId: number
    nationalityId: number
    languageIds: number[]
}



interface ContactNumber {
    number: string
    countryCode: string
    appIds: number[]
    isPrivate: boolean
}

interface Website {
    url: string
    isPrivate: boolean
}

interface SocialMediaAccount {
    platformId: number
    url: string
    isPrivate: boolean
}

interface PrivateDataPayload {
    contactNumbers: ContactNumber[]
    websites: Website[]
    socialMediaAccounts: SocialMediaAccount[]
}

interface LocationData {
    placeId?: string
    latitude?: string
    longitude?: string
    name?: string
    city?: string
    isActive: boolean
    refreshToken?: string
  }

export async function submitOnboardingProfile(data: OnboardingProfileData) {
    const response = await api.post('/api/v1/users/onboarding/profile', data)
    return response.data
}

export async function getGenders() {
    const { data } = await api.get('/api/v1/options/genders')
    return data
}

export async function getOrientations() {
    const { data } = await api.get('/api/v1/options/orientations')
    return data
}

export async function getEthnicities() {
    const { data } = await api.get('/api/v1/options/ethnicities')
    return data
}

export async function getNationalities() {
    const { data } = await api.get('/api/v1/options/nationalities')
    return data
}

export async function getLanguages() {
    const { data } = await api.get('/api/v1/options/languages')
    return data
}

export async function getHairColor() {
    const { data } = await api.get('/api/v1/options/hair-colors')
    return data
}

export async function submitOnboardingPrivateData(data: any) {
    const response = await api.post('/api/v1/users/onboarding/private-data', data)
    return response.data
}

export async function getSocialMediaPlatforms() {
    const { data } = await api.get('/api/v1/options/social-media-platforms')
    return data
}

export async function getMessagingApps() {
    const { data } = await api.get('/api/v1/options/messaging-apps')
    return data
}

export async function uploadUserMedia(file: File, orderNo: number) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'IMAGE')
    formData.append('orderNo', orderNo.toString())

    const response = await api.post('/api/v1/users/media', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return response.data
}

/**
 * Upload a single image with progress tracking.
 * 
 * @param file The File object to upload
 * @param orderNo The index (1-based) for this file
 * @param onProgress A callback that receives the current % progress (0-100)
 */
export async function uploadMediaWithProgress(
    file: File,
    orderNo: number,
    onProgress: (percent: number) => void
  ): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'IMAGE')
    formData.append('orderNo', orderNo.toString())
  
    const response = await api.post('/api/v1/users/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        // We'll only compute progress if total is available
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      },
    })
  
    return response.data // or however you want to structure return
  }

export async function saveUserLocation(data: LocationData) {
    const response = await api.post('/api/v1/users/locations', data)
    return response.data
  }
  
  export async function getLocationSuggestions(input: string) {
    const { data } = await api.get(`/api/v1/users/locations/suggestions?input=${encodeURIComponent(input)}`)
    return data
  }
