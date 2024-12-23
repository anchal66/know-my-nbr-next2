'use client'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/state/store'
import Link from 'next/link'
import { fetchWalletBalance } from '@/state/slices/walletSlice'
import { HeaderAddFundsModal } from '../HeaderAddFundsModal'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export function Header() {
  const dispatch = useDispatch<AppDispatch>()
  const { username, token } = useSelector((state: RootState) => state.auth)
  const userDetail = useSelector((state: RootState) => state.user.detail)
  const { balance } = useSelector((state: RootState) => state.wallet)

  const [showAddFundsModal, setShowAddFundsModal] = useState(false)

  const isLoggedIn = !!token && username

  useEffect(() => {
    // If the user is logged in, fetch wallet balance
    if (isLoggedIn) {
      dispatch(fetchWalletBalance())
    }
  }, [isLoggedIn, dispatch])

  let activeCityName = 'Unknown City'
  let otherCities: string[] = []

  if (isLoggedIn && userDetail && userDetail.locations.length > 0) {
    const activeLocation = userDetail.locations.find(loc => loc.isActive)
    if (activeLocation) {
      activeCityName = activeLocation.city.name
    }
    otherCities = userDetail.locations
      .filter(loc => !loc.isActive)
      .map(loc => loc.city.name)
  }

  return (
    <header className="w-full border-b bg-white py-2 px-4 flex items-center justify-between">
      {/* Left side: Logo and Nav links */}
      <div className="flex items-center space-x-4">
        <div className="font-bold text-xl">
          <Link href="/">Logo</Link>
        </div>
        <nav className="hidden md:flex space-x-4">
          <Link href="/">Home</Link>
          {isLoggedIn && <Link href={`/${username}`}>My Profile</Link>}
          {isLoggedIn && <Link href="/nbr-direct">NBR Direct</Link>}
          {isLoggedIn && <Link href="/messages">Messages</Link>}
        </nav>
      </div>

      {/* Center: Active city and dropdown of other cities */}
      <div className="flex-1 flex justify-center">
        {isLoggedIn && userDetail ? (
          <div className="flex items-center space-x-2">
            <span className="font-semibold">{activeCityName}</span>
            {otherCities.length > 0 && (
              <Select onValueChange={() => {}}>
                <SelectTrigger className="w-32" disabled>
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
        ) : (
          <div className="text-gray-500 italic">Not Logged In</div>
        )}
      </div>

      {/* Right side: Wallet info (balance + plus icon) */}
      <div className="flex items-center space-x-4">
        {isLoggedIn && (
          <div className="flex items-center space-x-2">
            <span className="font-semibold">
              {'\u20B9'} {balance.toFixed(2)} {/* INR symbol or use $ for USD, etc. */}
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
        )}
      </div>

      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <HeaderAddFundsModal
          onClose={() => setShowAddFundsModal(false)}
        />
      )}
    </header>
  )
}
