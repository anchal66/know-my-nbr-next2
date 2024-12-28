'use client'

import Link from 'next/link'
import { Fragment } from 'react'
import { FaHome, FaUser, FaEnvelope, FaEllipsisH, FaWallet, FaUsers, FaUserPlus, FaHeart, FaMapMarkerAlt, FaStar, FaSignOutAlt } from 'react-icons/fa'
import { MdBusiness } from 'react-icons/md'
import { Menu, Transition } from '@headlessui/react'
import { useRouter } from 'next/navigation'

interface BottomNavProps {
  username: string | null
  onLogout: () => void
  isLoggedIn: boolean
}

/**
 * Mobile bottom nav for small screens only (hidden on md+).
 */
export function BottomNav({ username, onLogout, isLoggedIn }: BottomNavProps) {
  const router = useRouter()

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
        border-t border-gray-700
        flex
        justify-around
        items-center
        h-16
        text-brand-white
        z-50
      "
    >
      {/* 1. Home */}
      <Link
        href="/"
        className="
          flex flex-col items-center justify-center
          text-sm transition-colors
          hover:text-brand-gold
        "
      >
        <FaHome className="text-2xl mb-1" />
        <span>Home</span>
      </Link>

      {/* 2. NBR Direct (Highlighted) */}
      <Link
        href="/nbr-direct"
        className="
          relative flex flex-col items-center justify-center
          text-sm
          transition-colors hover:opacity-80
          text-brand-gold
          animate-pulse
        "
      >
        <MdBusiness className="text-2xl mb-1" />
        <span>NBR</span>
      </Link>

      {/* 3. Messages */}
      <Link
        href="/messages"
        className="
          flex flex-col items-center justify-center
          text-sm transition-colors
          hover:text-brand-gold
        "
      >
        <FaEnvelope className="text-2xl mb-1" />
        <span>Messages</span>
      </Link>

      {/* 4. My Profile */}
      <Link
        href={`/${username}`}
        className="
          flex flex-col items-center justify-center
          text-sm transition-colors
          hover:text-brand-gold
        "
      >
        <FaUser className="text-2xl mb-1" />
        <span>Profile</span>
      </Link>

      {/* 5. More (Dropdown) using Headless UI */}
      <Menu as="div" className="relative flex flex-col items-center justify-center">
        {({ open }) => (
          <>
            <Menu.Button
              as="button"
              className="
                flex flex-col items-center justify-center
                text-sm transition-colors
                hover:text-brand-gold
                focus:outline-none
              "
            >
              <FaEllipsisH className="text-2xl mb-1" />
              <span>More</span>
            </Menu.Button>

            <Transition
              as={Fragment}
              show={open}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Menu.Items
                as="div"
                className="
                  absolute
                  bottom-full
                  right-0
                  mb-3
                  w-48
                  bg-neutral-700
                  text-white
                  rounded-lg
                  shadow-xl
                  py-2
                  z-50
                  focus:outline-none
                "
              >
                {/* Use 'as' or function pattern inside Menu.Item to avoid deprecated warnings */}
                <Menu.Item as="div">
                  {({ active }) => (
                    <Link
                      href="/my-wallet"
                      className={`
                        flex items-center gap-2 px-3 py-2 text-sm
                        rounded
                        ${active ? 'bg-neutral-600' : ''}
                      `}
                    >
                      <FaWallet className="text-base" />
                      <span>My Wallet</span>
                    </Link>
                  )}
                </Menu.Item>

                <Menu.Item as="div">
                  {({ active }) => (
                    <Link
                      href="/my-followers"
                      className={`
                        flex items-center gap-2 px-3 py-2 text-sm
                        rounded
                        ${active ? 'bg-neutral-600' : ''}
                      `}
                    >
                      <FaUsers className="text-base" />
                      <span>My Followers</span>
                    </Link>
                  )}
                </Menu.Item>

                <Menu.Item as="div">
                  {({ active }) => (
                    <Link
                      href="/my-following"
                      className={`
                        flex items-center gap-2 px-3 py-2 text-sm
                        rounded
                        ${active ? 'bg-neutral-600' : ''}
                      `}
                    >
                      <FaUserPlus className="text-base" />
                      <span>Following</span>
                    </Link>
                  )}
                </Menu.Item>

                <Menu.Item as="div">
                  {({ active }) => (
                    <Link
                      href="/my-matches"
                      className={`
                        flex items-center gap-2 px-3 py-2 text-sm
                        rounded
                        ${active ? 'bg-neutral-600' : ''}
                      `}
                    >
                      <FaHeart className="text-base" />
                      <span>My Matches</span>
                    </Link>
                  )}
                </Menu.Item>

                <Menu.Item as="div">
                  {({ active }) => (
                    <Link
                      href="/my-addresses"
                      className={`
                        flex items-center gap-2 px-3 py-2 text-sm
                        rounded
                        ${active ? 'bg-neutral-600' : ''}
                      `}
                    >
                      <FaMapMarkerAlt className="text-base" />
                      <span>My Addresses</span>
                    </Link>
                  )}
                </Menu.Item>

                <Menu.Item as="div">
                  {({ active }) => (
                    <Link
                      href="/my-reviews"
                      className={`
                        flex items-center gap-2 px-3 py-2 text-sm
                        rounded
                        ${active ? 'bg-neutral-600' : ''}
                      `}
                    >
                      <FaStar className="text-base" />
                      <span>My Reviews</span>
                    </Link>
                  )}
                </Menu.Item>

                <div className="border-t border-neutral-600 my-2" />

                <Menu.Item as="div">
                  {({ active }) => (
                    <button
                      onClick={onLogout}
                      className={`
                        w-full flex items-center gap-2 text-left px-3 py-2 text-sm
                        rounded text-red-500
                        ${active ? 'bg-neutral-600' : ''}
                      `}
                    >
                      <FaSignOutAlt className="text-base" />
                      <span>Logout</span>
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </nav>
  )
}
