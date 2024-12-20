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
          router.push('/')
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm p-4 border rounded">
        <h1 className="text-xl mb-4">Register</h1>
        <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="mb-2" />
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-2" />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-4" />
        <Button onClick={handleRegister}>Register</Button>
      </div>
    </div>
  )
}
