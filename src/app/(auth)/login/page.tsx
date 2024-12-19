// src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/state/slices/authSlice'
import { loginUser } from '@/lib/auth'
import { setToken } from '@/lib/cookies'
import { decodeToken } from '@/lib/jwt'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const router = useRouter()

  const handleLogin = async () => {
    try {
      const { token } = await loginUser({ usernameOrEmail, password })
      setToken(token)
      const decoded = decodeToken(token)
      if (decoded) {
        dispatch(setCredentials({
          token,
          username: decoded.username,
          role: decoded.role,
          onBoardingStatus: decoded.onBoardingStatus
        }))
        router.push('/')
      }
    } catch (error: any) {
      console.error(error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm p-4 border rounded">
        <h1 className="text-xl mb-4">Login</h1>
        <Input
          placeholder="Username or Email"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          className="mb-2"
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleLogin}>Login</Button>
      </div>
    </div>
  )
}
