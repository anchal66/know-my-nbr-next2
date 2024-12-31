// src/app/(auth)/register/page.tsx
'use client'

import { useEffect, useState, KeyboardEvent } from 'react'
import { registerUser } from '@/lib/auth'
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
import Image from 'next/image'

// Icons from lucide-react
import { Heart, MessageCircle, PhoneCall, Star } from 'lucide-react'

export default function RegisterPage() {
  const { onBoardingStatus, token } = useSelector((state: RootState) => state.auth)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

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

  const validateForm = () => {
    if (username.trim().length < 5) {
      setErrorMessage('Username should be at least 5 characters.')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.')
      return false
    }
    if (password.trim().length < 6) {
      setErrorMessage('Password should be at least 6 characters.')
      return false
    }
    setErrorMessage('')
    return true
  }

  const handleRegister = async () => {
    if (!validateForm()) return
    try {
      setIsLoading(true)
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

        if (decoded.onBoardingStatus !== 'FINISHED') {
          router.push('/onboarding/profile')
        } else {
          const userData = await getUserDetails()
          dispatch(setUserDetail(userData))
          router.push('/')
        }
      }
    } catch (error: any) {
      setIsLoading(false)
      setErrorMessage('An error occurred while registering. Please try again.')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRegister()
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
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
              Welcome to <span className="text-brand-gold font-semibold">knowmynbr.com</span>! 
              Connect beyond just swiping—access direct phone numbers, follow with points, 
              or become VIP for top discovery. No more missed connections; sign up and 
              redefine your dating experience!
            </p>
          </div>
          
          {/* Key Features with Icons */}
          <ul className="hidden md:flex flex-col gap-4 mt-4">
            <li className="flex items-center gap-2 text-gray-200">
              <Heart className="text-brand-gold" />
              Traditional Swiping & Matching
            </li>
            <li className="flex items-center gap-2 text-gray-200">
              <MessageCircle className="text-brand-gold" />
              Quick Chats & Messaging
            </li>
            <li className="flex items-center gap-2 text-gray-200">
              <PhoneCall className="text-brand-gold" />
              Direct Access to Private Contacts and Social Media through NBR Direct
            </li>
            <li className="flex items-center gap-2 text-gray-200">
              <Star className="text-brand-gold" />
              VIP Membership & Top Listings
            </li>
          </ul>
        </div>

        {/* RIGHT COLUMN: Register Form */}
        <div className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-sm p-6 border border-gray-700 rounded shadow-md bg-neutral-800">
            <h2 className="text-2xl font-semibold mb-4 text-center text-brand-gold">
              Create Your Account
            </h2>
            <p className="text-center text-sm text-gray-400 mb-6">
              Join us and explore a world of possibilities!
            </p>

            {errorMessage && (
              <p className="mb-4 text-center text-red-500 text-sm">
                {errorMessage}
              </p>
            )}

            <Input
              placeholder="Username (min 5 characters)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              className="mb-4 bg-neutral-700 text-white placeholder-gray-400"
              aria-label="Username"
              type="text"
              inputMode="text"
            />
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="mb-4 bg-neutral-700 text-white placeholder-gray-400"
              aria-label="Email"
              type="email"
              inputMode="email"
            />
            <Input
              placeholder="Password (min 6 characters)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="mb-6 bg-neutral-700 text-white placeholder-gray-400"
              aria-label="Password"
            />

            <Button
              onClick={handleRegister}
              className="w-full mb-4"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-gold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}