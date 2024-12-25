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
import { getUserDetails } from '@/lib/user'
import { setUserDetail } from '@/state/slices/userSlice'
import Link from 'next/link'

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
        }));

        // Immediately fetch user detail and store it
        const userData = await getUserDetails()
        dispatch(setUserDetail(userData))

        router.push('/')
      }
    } catch (error: any) {
      console.error(error)
      // Optionally, display error message to the user
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-900">
      <div className="w-full max-w-sm p-6 border border-gray-700 rounded shadow-md bg-neutral-800 text-white">
        <h1 className="text-2xl font-semibold mb-6 text-center text-brand-gold">Login</h1>
        <Input
          placeholder="Username or Email"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          className="mb-4 bg-neutral-700 text-white placeholder-gray-400"
          aria-label="Username or Email"
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 bg-neutral-700 text-white placeholder-gray-400"
          aria-label="Password"
        />
        <Button onClick={handleLogin} className="w-full mb-4">
          Login
        </Button>
        <p className="text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link href="/register" className="text-brand-gold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )  
}
