// src/app/page.tsx
'use client'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/state/store'
import { logout } from '@/state/slices/authSlice'
import { removeToken } from '@/lib/cookies'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const { username } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()

  const handleLogout = () => {
    removeToken()
    dispatch(logout())
    window.location.href = '/login'
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Welcome, {username}</h1>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  )
}
