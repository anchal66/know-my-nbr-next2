'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { removeToken } from '@/lib/cookies'
import { logout } from '@/state/slices/authSlice'
import { fetchWalletBalance } from '@/state/slices/walletSlice'
import { RootState, AppDispatch } from '@/state/store'
import { useSelector, useDispatch } from 'react-redux'
import { DesktopNav } from './DesktopNav'
import { CitySelector } from './CitySelector'
import { HeaderAddFundsModal } from '../HeaderAddFundsModal'
import PaymentServiceUnavailableModal from '../PaymentServiceUnavailableModal'
import { BottomNav } from './BottomNav'
import { getUserDetails } from '@/lib/user'
import { setUserDetail } from '@/state/slices/userSlice'

export function Header() {
  const dispatch = useDispatch<AppDispatch>()

  const { username, token } = useSelector((state: RootState) => state.auth)
  const userDetail = useSelector((state: RootState) => state.user.detail)
  const { balance } = useSelector((state: RootState) => state.wallet)
  const isLoggedIn = !!token && !!username

  // State to toggle Add Funds Modal
  const [showAddFundsModal, setShowAddFundsModal] = useState(false)
  // State to toggle Payment Service Unavailable Modal
  const [showServiceUnavailableModal, setShowServiceUnavailableModal] = useState(false)

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

  // Additional fetchWalletBalance if needed
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchWalletBalance())
    }
  }, [isLoggedIn, dispatch])

  function handleLogout() {
    removeToken()
    dispatch(logout())
    window.location.href = '/login'
  }

  // If the payment service is unavailable
  const handleServiceUnavailable = () => {
    setShowAddFundsModal(false)
    setShowServiceUnavailableModal(true)
  }

  return (
    <>
      <header
        className="
          w-full bg-black border-b border-gray-700 text-brand-white
          flex items-center justify-between
          px-4 h-16
        "
      >
        {/* Logo + slight spacing for city dropdown on small screens */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="Logo"
              width={120}
              height={60}
              priority
              className="shrink-0"
            />
          </Link>
        </div>

        {/* Desktop Nav (md+) */}
        <DesktopNav username={username} isLoggedIn={isLoggedIn} onLogout={handleLogout} />

        {/* Right side: city + wallet or "Not Logged In" */}
        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <>
              {/* City Selector */}
              <div className="hidden sm:block"> 
                <CitySelector />
              </div>

              {/* Wallet */}
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-semibold">{'\u20B9'} {balance.toFixed(2)}</span>
                <button
                  onClick={() => setShowAddFundsModal(true)}
                  className="rounded-full border border-gray-600 p-1 hover:bg-neutral-700 transition-colors"
                  title="Add Funds"
                >
                  <svg
                    className="h-5 w-5 text-green-400"
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
            </>
          ) : (
            <div className="text-gray-400 italic text-sm">Not Logged In</div>
          )}
        </div>
      </header>

      {/* On very small screens, show CitySelector below the header if needed */}
      {isLoggedIn && (
        <div className="sm:hidden bg-black border-b border-gray-700 px-4 py-2 flex">
          <CitySelector />
        </div>
      )}

      {/* BottomNav on small screens */}
      <BottomNav
        isLoggedIn={isLoggedIn}
        username={username}
        onLogout={handleLogout}
      />

      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <HeaderAddFundsModal
          onClose={() => setShowAddFundsModal(false)}
          onServiceUnavailable={handleServiceUnavailable}
        />
      )}

      {/* Payment Service Unavailable Modal */}
      {showServiceUnavailableModal && (
        <PaymentServiceUnavailableModal
          onClose={() => setShowServiceUnavailableModal(false)}
        />
      )}
    </>
  )
}
