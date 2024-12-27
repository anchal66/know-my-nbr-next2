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
import { Menu } from '@headlessui/react'
import { FaChevronDown } from 'react-icons/fa'

// Import your new BottomNav component
import { BottomNav } from './BottomNav'

export function Header() {
  const dispatch = useDispatch<AppDispatch>()

  const { username, token } = useSelector((state: RootState) => state.auth)
  const userDetail = useSelector((state: RootState) => state.user.detail)
  const { balance } = useSelector((state: RootState) => state.wallet)
  const isLoggedIn = !!token && !!username

  const [showAddFundsModal, setShowAddFundsModal] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string>('Unknown City')

  // logout
  function handleLogout() {
    removeToken()
    dispatch(logout())
    window.location.href = '/login'
  }

  // fetch user data
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

  // derive city
  useEffect(() => {
    if (!isLoggedIn || !userDetail || userDetail.locations.length === 0) {
      setSelectedCity('Unknown City')
      return
    }
    const activeLoc = userDetail.locations.find(loc => loc.isActive)
    setSelectedCity(activeLoc ? activeLoc.city.name : 'Unknown City')
  }, [userDetail, isLoggedIn])

  // other cities
  const otherCities: string[] = []
  if (isLoggedIn && userDetail && userDetail.locations.length > 0) {
    otherCities.push(
      ...userDetail.locations
        .filter(loc => !loc.isActive)
        .map(loc => loc.city.name)
    )
  }

  function handleCityChange(value: string) {
    setSelectedCity(value)
    // If you want to set city in backend, do so here
  }

  return (
    <>
      {/* TOP HEADER for all screens */}
      <header className="w-full h-16 bg-neutral-800 border-b border-gray-700 text-brand-white flex items-center justify-between px-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={120}
            height={60}
            priority
            className="shrink-0"
          />
        </Link>

        {/* Desktop Nav (md+) */}
        <nav className="hidden md:flex items-center space-x-6 font-semibold text-sm">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          {isLoggedIn && (
            <Link href={`/${username}`} className="hover:underline">
              My Profile
            </Link>
          )}
          {isLoggedIn && (
            <Link href="/nbr-direct" className="hover:underline">
              NBR Direct
            </Link>
          )}
          {isLoggedIn && (
            <Link href="/messages" className="hover:underline">
              Messages
            </Link>
          )}
          {/* More dropdown */}
          {isLoggedIn && (
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="flex items-center gap-1 hover:underline">
                More <FaChevronDown className="text-xs" />
              </Menu.Button>
              <Menu.Items
                className="
                  absolute mt-2 w-44 origin-top-right right-0
                  bg-neutral-700 text-white
                  rounded shadow-lg focus:outline-none z-50
                "
              >
                <div className="py-1 text-sm">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/my-wallet"
                        className={`block px-4 py-2 ${active ? 'bg-neutral-600' : ''}`}
                      >
                        My Wallet
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/my-followers"
                        className={`block px-4 py-2 ${active ? 'bg-neutral-600' : ''}`}
                      >
                        My Followers
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/my-following"
                        className={`block px-4 py-2 ${active ? 'bg-neutral-600' : ''}`}
                      >
                        Users I Follow
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/my-matches"
                        className={`block px-4 py-2 ${active ? 'bg-neutral-600' : ''}`}
                      >
                        My Matches
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/my-addresses"
                        className={`block px-4 py-2 ${active ? 'bg-neutral-600' : ''}`}
                      >
                        My Addresses
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/my-reviews"
                        className={`block px-4 py-2 ${active ? 'bg-neutral-600' : ''}`}
                      >
                        My Reviews
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`block w-full text-left px-4 py-2 ${
                          active ? 'bg-neutral-600' : ''
                        }`}
                      >
                        Logout
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Menu>
          )}
        </nav>

        {/* Right side: city + wallet or "Not logged in" */}
        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <>
              {/* City */}
              <Select
                value={selectedCity}
                onValueChange={handleCityChange}
              >
                <SelectTrigger className="w-[130px] text-sm border border-gray-600 bg-neutral-700">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-700 text-white">
                  <SelectItem value={selectedCity}>{selectedCity}</SelectItem>
                  {otherCities.map((city, idx) => (
                    <SelectItem key={idx} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Wallet */}
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-semibold">{'\u20B9'} {balance.toFixed(2)}</span>
                <button
                  onClick={() => setShowAddFundsModal(true)}
                  className="rounded-full border border-gray-600 p-1 hover:bg-neutral-700"
                  title="Add Funds"
                >
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="text-gray-400 italic text-sm">
              Not Logged In
            </div>
          )}
        </div>
      </header>

      {/* BottomNav on small screens */}
      <BottomNav
        isLoggedIn={isLoggedIn}
        username={username}
        onLogout={handleLogout}
      />

      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <HeaderAddFundsModal onClose={() => setShowAddFundsModal(false)} />
      )}
    </>
  )
}
