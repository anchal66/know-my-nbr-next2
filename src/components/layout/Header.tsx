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

  const isLoggedIn = !!token && username

  const handleLogout = () => {
    removeToken()
    dispatch(logout())
    window.location.href = '/login'
  }

  // Fetch wallet if logged in
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchWalletBalance())
    }
    setUserDetails();
  }, [isLoggedIn, dispatch])

  const setUserDetails = async () => {
    const userData = await getUserDetails()
    dispatch(setUserDetail(userData));
  }

  // City logic
  let activeCityName = 'Unknown City'
  let otherCities: string[] = []
  if (isLoggedIn && userDetail && userDetail.locations.length > 0) {
    const activeLoc = userDetail.locations.find(loc => loc.isActive)
    if (activeLoc) {
      activeCityName = activeLoc.city.name
    }
    otherCities = userDetail.locations
      .filter(loc => !loc.isActive)
      .map(loc => loc.city.name)
  }

  function toggleMobileMenu() {
    setMobileMenuOpen(prev => !prev)
  }

  return (
    <header className="w-full border-b bg-background text-foreground dark:bg-background dark:text-foreground py-2 px-4 relative z-10">
      <div className="flex items-center justify-between">
        {/* Left side: Logo + hamburger */}
        <div className="flex items-center space-x-4">
          <div className="font-bold text-xl">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Logo"
                width={80}
                height={40}
                priority
              />
            </Link>
          </div>

          {/* Hamburger (show on mobile only) */}
          <button
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <svg
              className="h-6 w-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Center: City + Wallet (visible on both mobile and desktop) */}
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              {/* City info */}
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{activeCityName}</span>
                {otherCities.length > 0 && (
                  <Select onValueChange={() => { }} disabled>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Other Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      {otherCities.map((city, idx) => (
                        <SelectItem key={idx} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Wallet info */}
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <button
                className="rounded border p-3 hover:bg-red-500"
                onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <div className="text-gray-500 italic">Not Logged In</div>
          )}
        </div>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex space-x-4 mt-2">
        <Link href="/">Home</Link>
        {isLoggedIn && <Link href={`/${username}`}>My Profile</Link>}
        {isLoggedIn && <Link href="/nbr-direct">NBR Direct</Link>}
        {isLoggedIn && <Link href="/messages">Messages</Link>}
      </nav>

      {/* Mobile nav (toggle) */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white border-t py-2">
          <nav className="flex flex-col space-y-2 px-4">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            {isLoggedIn && (
              <>
                <Link href={`/${username}`} onClick={() => setMobileMenuOpen(false)}>
                  My Profile
                </Link>
                <Link href="/nbr-direct" onClick={() => setMobileMenuOpen(false)}>
                  NBR Direct
                </Link>
                <Link href="/messages" onClick={() => setMobileMenuOpen(false)}>
                  Messages
                </Link>
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
