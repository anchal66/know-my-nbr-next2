// src/app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import { registerUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleRegister = async () => {
    try {
      const { token } = await registerUser({ username, email, password })
      // After register, you might directly log user in or redirect to login
      // For simplicity, just store token in cookie (if desired):
      // setToken(token) -- if the API directly logs you in on registration
      // or redirect to login page
      router.push('/login')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm p-4 border rounded">
        <h1 className="text-xl mb-4">Register</h1>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-2"
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-2"
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleRegister}>Register</Button>
      </div>
    </div>
  )
}
