'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Link from 'next/link'
import { RootState, AppDispatch } from '@/state/store'
import { fetchWalletBalance } from '@/state/slices/walletSlice'
import { HeaderAddFundsModal } from '../HeaderAddFundsModal'
import { logout } from '@/state/slices/authSlice'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { getUserDetails } from '@/lib/user'
import { setUserDetail } from '@/state/slices/userSlice'
import Image from 'next/image'
import { removeToken } from '@/lib/cookies'

export function Header() {
  const dispatch = useDispatch<AppDispatch>()

  const { username, token } = useSelector((state: RootState) => state.auth)
  const userDetail = useSelector((state: RootState) => state.user.detail)
  const { balance } = useSelector((state: RootState) => state.wallet)

  const [showAddFundsModal, setShowAddFundsModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string>('Unknown City')

  const isLoggedIn = !!token && !!username

  function handleLogout() {
    removeToken()
    dispatch(logout())
    window.location.href = '/login'
  }

  // Fetch wallet if logged in, and user details
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchWalletBalance())
      fetchUserDetails()
    }
  }, [isLoggedIn, dispatch])

  async function fetchUserDetails() {
    try {
      const userData = await getUserDetails()
      dispatch(setUserDetail(userData))
    } catch (err) {
      console.error('Error fetching user details:', err)
    }
  }

  // Derive active city + other cities
  useEffect(() => {
    if (!isLoggedIn || !userDetail || userDetail.locations.length === 0) {
      setSelectedCity('Unknown City')
      return
    }
    const activeLoc = userDetail.locations.find(loc => loc.isActive)
    const activeName = activeLoc ? activeLoc.city.name : 'Unknown City'
    setSelectedCity(activeName)
  }, [userDetail, isLoggedIn])

  // Other city list
  const otherCities: string[] = []
  if (isLoggedIn && userDetail && userDetail.locations.length > 0) {
    otherCities.push(
      ...userDetail.locations
        .filter(loc => !loc.isActive)
        .map(loc => loc.city.name)
    )
  }

  function toggleMobileMenu() {
    setMobileMenuOpen(prev => !prev)
  }

  // Handle city selection (only if you want to actually switch city in Redux or call some API)
  function handleCityChange(value: string) {
    setSelectedCity(value)
    // If you want to set city as active in backend or Redux, do so here...
  }

  return (
    <header
      className="
        w-full 
        border-b 
        bg-background 
        text-foreground 
        dark:bg-background 
        dark:text-foreground 
        px-4 
        py-2 
        flex 
        items-center 
        justify-between 
        relative 
        z-20
      "
    >
      {/* Left side: Logo + Desktop nav */}
      <div className="flex items-center space-x-4">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Logo"
            width={80}
            height={40}
            priority
            className="shrink-0"
          />
        </Link>

        {/* Desktop Nav (inline with logo) */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/">Home</Link>
          {isLoggedIn && <Link href={`/${username}`}>My Profile</Link>}
          {isLoggedIn && <Link href="/nbr-direct">NBR Direct</Link>}
          {isLoggedIn && <Link href="/messages">Messages</Link>}
        </nav>
      </div>

      {/* Right side: City dropdown, Wallet, Logout (desktop only), Hamburger */}
      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          <>
            {/* City Dropdown */}
            <Select
              value={selectedCity}
              onValueChange={handleCityChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={selectedCity}>
                  {selectedCity}
                </SelectItem>
                {otherCities.map((city, idx) => (
                  <SelectItem key={idx} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Wallet */}
            <div className="flex items-center space-x-2">
              <span className="font-semibold">
                {'\u20B9'} {balance.toFixed(2)}
              </span>
              <button
                onClick={() => setShowAddFundsModal(true)}
                className="rounded-full border p-1 hover:bg-gray-100"
              >
                <svg
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>

            {/* Logout (desktop only) */}
            <button
              className="hidden md:block rounded border p-2 bg-red-500 text-white hover:bg-red-600"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <div className="text-gray-500 italic">Not Logged In</div>
        )}

        {/* Hamburger (mobile only) */}
        <button
          className="md:hidden"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <svg
            className="h-6 w-6 text-gray-700 dark:text-gray-200"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile nav (absolute overlay) */}
      {mobileMenuOpen && (
        <div
          className="
            md:hidden 
            absolute 
            top-full 
            left-0 
            w-full 
            bg-black/75 
            text-white 
            py-3 
            shadow-lg
            z-50
          "
        >
          <nav className="flex flex-col space-y-4 px-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:underline"
            >
              Home
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  href={`/${username}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:underline"
                >
                  My Profile
                </Link>
                <Link
                  href="/nbr-direct"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:underline"
                >
                  NBR Direct
                </Link>
                <Link
                  href="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:underline"
                >
                  Messages
                </Link>
                {/* Logout (mobile only) */}
                <button
                  onClick={handleLogout}
                  className="border p-2 rounded bg-red-500 text-white text-left"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <HeaderAddFundsModal onClose={() => setShowAddFundsModal(false)} />
      )}
    </header>
  )
}
