// src/components/layout/HeaderWrapper.tsx
'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import { Header } from './Header'

export function HeaderWrapper() {
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.token && !!state.auth.username)
  const hasFinishedOnboarding = useSelector((state: RootState) => state.auth.onBoardingStatus === 'FINISHED')

  if (!isLoggedIn || !hasFinishedOnboarding) {
    return null
  }
  return <Header />
}
