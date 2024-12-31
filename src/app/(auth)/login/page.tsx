// src/app/(auth)/login/page.tsx
'use client'

import { useEffect, useState, KeyboardEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
import { RootState } from '@/state/store'
import Image from 'next/image'

// Icons from lucide-react (installed in your package.json)
import { Heart, MessageCircle, PhoneCall, Star } from 'lucide-react'

export default function LoginPage() {
  const { onBoardingStatus, token } = useSelector((state: RootState) => state.auth)

  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const dispatch = useDispatch()
  const router = useRouter()

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

  const validateForm = () => {
    if (!usernameOrEmail.trim()) {
      setErrorMessage('Please enter your username or email.')
      return false
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.')
      return false
    }
    setErrorMessage('')
    return true
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)
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

        // Immediately fetch user detail and store it
        const userData = await getUserDetails()
        dispatch(setUserDetail(userData))

        router.push('/')
      }
    } catch (error: any) {
      setIsLoading(false)
      setErrorMessage('Invalid credentials. Please try again.')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Two-column layout, stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto">
        {/* LEFT COLUMN: Hero / Features Section */}
        <div className="flex flex-col justify-center p-6 md:p-12 border-b border-neutral-800 md:border-b-0 md:border-r border-neutral-700">
          <div className="flex flex-col items-center md:items-start">
            {/* Logo */}
            <Image
              src="/logo2.png"
              alt="Know My Nbr Logo"
              width={150}
              height={150}
              priority
              className="mb-4"
            />
            {/* Title & Tagline */}
            <h1 className="text-3xl font-bold text-brand-gold text-center md:text-left">
              Know-My-Nbr
            </h1>
            <p className="text-sm md:text-base text-gray-400 mb-4 text-center md:text-left">
              Redefining Dating
            </p>
            {/* Intro Paragraph for Desktop */}
            <p className="hidden md:block text-sm md:text-base leading-6 mb-6 text-gray-300">
              Discover a whole new way to connect and engage! 
              At <span className="text-brand-gold font-semibold">knowmynbr.com</span>, 
              you can swipe, match, message, and even share direct private 
              contact details or social media though NBR direct. Follow users with points for 
              exclusive access, or opt for VIP membership to appear at the top in 
              NBR Direct. Join us, and experience dating differently!
            </p>
          </div>

          {/* Key Features with Icons */}
          <ul className="hidden md:flex flex-col gap-4 mt-4">
            <li className="flex items-center gap-2 text-gray-200">
              <Heart className="text-brand-gold" />
              Tinder-like Swiping & Matching
            </li>
            <li className="flex items-center gap-2 text-gray-200">
              <MessageCircle className="text-brand-gold" />
              Instant Messaging & Chat
            </li>
            <li className="flex items-center gap-2 text-gray-200">
              <PhoneCall className="text-brand-gold" />
              Direct Contact & Social Media Access
            </li>
            <li className="flex items-center gap-2 text-gray-200">
              <Star className="text-brand-gold" />
              VIP & Featured Memberships
            </li>
          </ul>
        </div>

        {/* RIGHT COLUMN: Login Form */}
        <div className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-sm p-6 border border-gray-700 rounded shadow-md bg-neutral-800">
            <h2 className="text-2xl font-semibold mb-4 text-center text-brand-gold">
              Welcome Back
            </h2>
            <p className="text-center text-sm text-gray-400 mb-6">
              We’re happy to see you again. Please login to continue.
            </p>

            {/* Error Message */}
            {errorMessage && (
              <p className="mb-4 text-center text-red-500 text-sm">
                {errorMessage}
              </p>
            )}

            <Input
              placeholder="Username or Email"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="mb-4 bg-neutral-700 text-white placeholder-gray-400"
              aria-label="Username or Email"
              type="text"
              inputMode="text"
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="mb-6 bg-neutral-700 text-white placeholder-gray-400"
              aria-label="Password"
            />

            <Button
              onClick={handleLogin}
              className="w-full mb-4"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Don’t have an account?{' '}
              <Link href="/register" className="text-brand-gold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
