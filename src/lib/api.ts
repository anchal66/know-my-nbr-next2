// src/lib/api.ts
import axios from 'axios'
import { getToken, removeToken } from './cookies'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
})

const excludedEndpoints: string[] = ['/api/auth/login', '/api/auth/register'];

api.interceptors.request.use((config) => {
  const { url } = config
  const isExcluded = url ? excludedEndpoints.includes(url) : false

  const token = getToken()
  if (!isExcluded && token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      const { message } = error.response.data
      if (message && message.includes('Onboarding not completed')) {
        // Onboarding incomplete, redirect to onboarding step
        if (typeof window !== 'undefined') {
          window.location.href = '/onboarding/profile'
        }
      } else {
        // Possibly token expired or another 403 reason
        removeToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api