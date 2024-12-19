// src/app/providers.tsx
'use client'

import { ReactNode, useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/state/store'
import { getToken } from '@/lib/cookies'
import { decodeToken, isTokenExpired } from '@/lib/jwt'
import { setCredentials, logout } from '@/state/slices/authSlice'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    const token = getToken()
    if (token) {
      if (!isTokenExpired(token)) {
        const decoded = decodeToken(token)
        if (decoded) {
          store.dispatch(setCredentials({
            token,
            username: decoded.username,
            role: decoded.role,
            onBoardingStatus: decoded.onBoardingStatus
          }))
        }
      } else {
        // Token expired
        store.dispatch(logout())
      }
    }
  }, [])

  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}
