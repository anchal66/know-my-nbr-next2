'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import { Header } from './Header'

export function HeaderWrapper() {
  const { isLoggedIn, hasFinishedOnboarding } = useSelector((state: RootState) => ({
    isLoggedIn: !!state.auth.token && !!state.auth.username,
    hasFinishedOnboarding: state.auth.onBoardingStatus === 'FINISHED',
  }))

  if (!isLoggedIn || !hasFinishedOnboarding) {
    return null
  }

  return <Header />
}
