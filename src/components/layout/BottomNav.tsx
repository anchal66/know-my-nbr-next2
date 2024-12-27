'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaHome, FaUser, FaEnvelope, FaEllipsisH } from 'react-icons/fa'
import { MdBusiness } from 'react-icons/md'

// For "More" menu overlay
import { useRouter } from 'next/navigation'

interface BottomNavProps {
  username: string | null
  onLogout: () => void
  isLoggedIn: boolean
}

/**
 * Mobile bottom nav for small screens only (hidden on md+).
 * 
 * - Home => "/"
 * - NBR Direct => "/nbr-direct"
 * - Messages => "/messages"
 * - Profile => if you'd like "My Profile" to go "/my-profile", just do so here,
 *   or if you'd like it to go "/{username}", you can do that with a condition if (username) ...
 * - More => opens an overlay with extra links + Logout
 */
export function BottomNav({ username, onLogout, isLoggedIn }: BottomNavProps) {
  const router = useRouter()
  const [showMore, setShowMore] = useState(false)

  if (!isLoggedIn) return null

  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        md:hidden
        bg-neutral-800
        border-t
        border-gray-700
        flex
        justify-around
        items-center
        h-14
        text-brand-white
        z-50
      "
    >
      {/* 1. Home */}
      <Link href="/" className="flex flex-col items-center justify-center">
        <FaHome className="text-xl" />
        <span className="text-xs">Home</span>
      </Link>

      {/* 2. NBR Direct */}
      <Link href="/nbr-direct" className="flex flex-col items-center justify-center">
        <MdBusiness className="text-xl" />
        <span className="text-xs">NBR</span>
      </Link>

      {/* 3. Messages */}
      <Link href="/messages" className="flex flex-col items-center justify-center">
        <FaEnvelope className="text-xl" />
        <span className="text-xs">Messages</span>
      </Link>

      {/* 4. My Profile */}
      <Link href={`/${username}`} className="flex flex-col items-center justify-center">
        <FaUser className="text-xl" />
        <span className="text-xs">Profile</span>
      </Link>

      {/* 5. More (Hamburger) */}
      <button
        onClick={() => setShowMore((prev) => !prev)}
        className="flex flex-col items-center justify-center relative"
      >
        <FaEllipsisH className="text-xl" />
        <span className="text-xs">More</span>

        {showMore && (
          <div
            className="
              absolute
              bottom-full
              right-0
              mb-2
              w-44
              bg-neutral-700
              text-white
              rounded
              shadow-lg
              px-2
              py-2
              z-50
            "
          >
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href="/my-wallet"
                  onClick={() => setShowMore(false)}
                  className="block px-2 py-1 hover:bg-neutral-600 rounded"
                >
                  My Wallet
                </Link>
              </li>
              <li>
                <Link
                  href="/my-followers"
                  onClick={() => setShowMore(false)}
                  className="block px-2 py-1 hover:bg-neutral-600 rounded"
                >
                  My Followers
                </Link>
              </li>
              <li>
                <Link
                  href="/my-following"
                  onClick={() => setShowMore(false)}
                  className="block px-2 py-1 hover:bg-neutral-600 rounded"
                >
                  Users I Follow
                </Link>
              </li>
              <li>
                <Link
                  href="/my-matches"
                  onClick={() => setShowMore(false)}
                  className="block px-2 py-1 hover:bg-neutral-600 rounded"
                >
                  My Matches
                </Link>
              </li>
              <li>
                <Link
                  href="/my-addresses"
                  onClick={() => setShowMore(false)}
                  className="block px-2 py-1 hover:bg-neutral-600 rounded"
                >
                  My Addresses
                </Link>
              </li>
              <li>
                <Link
                  href="/my-reviews"
                  onClick={() => setShowMore(false)}
                  className="block px-2 py-1 hover:bg-neutral-600 rounded"
                >
                  My Reviews
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    onLogout()
                    setShowMore(false)
                  }}
                  className="w-full text-left px-2 py-1 hover:bg-neutral-600 rounded"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </button>
    </nav>
  )
}
