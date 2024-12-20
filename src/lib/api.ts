// src/lib/api.ts
import axios from 'axios'
import { getToken, removeToken } from './cookies'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
})

const excludedEndpoints: string[] = ['/api/auth/login', '/api/auth/register'];

api.interceptors.request.use((config) => {
  // Extract the request URL path
  const { url } = config
  // Check if the URL exactly matches any excluded endpoint
  const isExcluded = excludedEndpoints.includes(url!)

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
        // Maybe token expired or another 403 reason, logout and redirect to login TODO
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
