// src/app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import { registerUser, loginUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { setToken } from '@/lib/cookies'
import { decodeToken } from '@/lib/jwt'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/state/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserDetails } from '@/lib/user'
import { setUserDetail } from '@/state/slices/userSlice'
import Link from 'next/link'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const dispatch = useDispatch()

  const handleRegister = async () => {
    try {
      const { token } = await registerUser({ username, email, password })
      setToken(token)
      const decoded = decodeToken(token)
      if (decoded) {
        dispatch(setCredentials({
          token,
          username: decoded.username,
          role: decoded.role,
          onBoardingStatus: decoded.onBoardingStatus
        }))

        // If onboarding is not finished, redirect to step 1
        if (decoded.onBoardingStatus !== 'FINISHED') {
          router.push('/onboarding/profile')
        } else {
          // Immediately fetch user detail
          const userData = await getUserDetails()
          dispatch(setUserDetail(userData))
          router.push('/')
        }
      }
    } catch (error: any) {
      console.error(error)
      // Optionally, display error message to the user
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm p-6 border rounded shadow-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">Register</h1>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4"
          aria-label="Username"
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4"
          aria-label="Email"
          type="email"
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6"
          aria-label="Password"
        />
        <Button onClick={handleRegister} className="w-full mb-4">Register</Button>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
