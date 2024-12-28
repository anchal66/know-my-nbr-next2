// src/lib/api.ts
import axios from 'axios'
import { getToken, removeToken } from './cookies'
import { showSnackbar } from '@/state/slices/snackbarSlice'
import { store } from '@/state/store'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
})

const excludedEndpoints: string[] = ['/api/auth/login', '/api/auth/register']

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
    // Your existing 403 logic
    if (error.response && error.response.status === 403) {
      const { message } = error.response.data
      if (message && message.includes('Onboarding not completed')) {
        // Onboarding incomplete, redirect to onboarding
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
    } else {
      // For ANY other non-2xx status, show a snackbar with the server's message
      const errorData = error.response?.data
      const status = error.response?.status
      const errorMessage =
        errorData?.message ||
        `Something went wrong (status: ${status || 'unknown'})`

      // Dispatch the showSnackbar action to display a global error
      store.dispatch(showSnackbar({ message: errorMessage, type: 'error', errorData: errorData }))
    }

    return Promise.reject(error)
  }
)

export default api
