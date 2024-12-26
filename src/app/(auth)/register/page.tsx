// src/app/(auth)/register/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { registerUser, loginUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { setToken } from '@/lib/cookies'
import { decodeToken } from '@/lib/jwt'
import { useDispatch, useSelector } from 'react-redux'
import { setCredentials } from '@/state/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserDetails } from '@/lib/user'
import { setUserDetail } from '@/state/slices/userSlice'
import Link from 'next/link'
import { RootState } from '@/state/store'

export default function RegisterPage() {
  console.log("Register...");
  const { onBoardingStatus, token } = useSelector((state: RootState) => state.auth)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    if (token) {
      if (onBoardingStatus === 'FINISHED') {
        router.push('/')
        return
      }
      if (onBoardingStatus === 'LOCATION') {
        router.push('/onboarding/location')
        return
      }
      if (onBoardingStatus === 'MEDIA_UPLOADED') {
        router.push('/onboarding/media')
        return
      }
      if (onBoardingStatus === 'PRIVATE_CONTACT') {
        router.push('/onboarding/private-data')
        return
      }
      if (onBoardingStatus === 'EMPTY' || onBoardingStatus === 'PROFILE') {
        router.push('/onboarding/profile')
        return
      }
      if (onBoardingStatus !== 'FINISHED') {
        router.push('/onboarding/profile')
        return
      }
    }
  }, [token, onBoardingStatus, router])

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
    <div className="flex min-h-screen items-center justify-center bg-neutral-900">
      <div className="w-full max-w-sm p-6 border border-gray-700 rounded shadow-md bg-neutral-800 text-white">
        <h1 className="text-2xl font-semibold mb-6 text-center text-brand-gold">Register</h1>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 bg-neutral-700 text-white placeholder-gray-400"
          aria-label="Username"
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 bg-neutral-700 text-white placeholder-gray-400"
          aria-label="Email"
          type="email"
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 bg-neutral-700 text-white placeholder-gray-400"
          aria-label="Password"
        />
        <Button onClick={handleRegister} className="w-full mb-4">
          Register
        </Button>
        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-gold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )  
}
