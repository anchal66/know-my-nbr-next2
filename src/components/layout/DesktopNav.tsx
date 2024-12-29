'use client'

import Link from 'next/link'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { usePathname } from 'next/navigation'

interface DesktopNavProps {
  username: string | null
  isLoggedIn: boolean
  onLogout: () => void
}

export function DesktopNav({ username, isLoggedIn, onLogout }: DesktopNavProps) {
  const pathname = usePathname()

  // Determine if we are on NBR Direct page
  const isOnNBRDirect = pathname === '/nbr-direct'

  return (
    <nav className="hidden md:flex items-center space-x-6 font-semibold text-sm">
      <Link
        href="/"
        className={`hover:underline ${pathname === '/' ? 'text-brand-gold' : ''}`}
      >
        Home
      </Link>

      {isLoggedIn && (
        <Link
          href={`/${username}`}
          className={`hover:underline ${pathname === `/${username}` ? 'text-brand-gold' : ''}`}
        >
          My Profile
        </Link>
      )}

      {isLoggedIn && (
        <Link
          href="/nbr-direct"
          className={`
            relative inline-block px-3 py-1 font-semibold
            bg-clip-text text-transparent
            hover:opacity-90 transition-opacity duration-300
            ${isOnNBRDirect
              ? 'bg-gradient-to-r from-brand-gold via-yellow-400 to-brand-gold text-brand-gold'
              : 'bg-gradient-to-r from-brand-gold via-yellow-400 to-brand-gold animate-pulse'
            }
          `}
        >
          NBR Direct
        </Link>
      )}

      {isLoggedIn && (
        <Link
          href="/messages"
          className={`hover:underline ${pathname === '/messages' ? 'text-brand-gold' : ''}`}
        >
          Messages
        </Link>
      )}

      {/* More dropdown (Desktop) */}
      {isLoggedIn && (
        <Menu as="div" className="relative inline-block text-left">
          {({ open }) => (
            <>
              <Menu.Button className="flex items-center gap-1 hover:underline transition-colors">
                More
                <FaChevronDown
                  className={`text-xs transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
              </Menu.Button>

              <Transition
                as={Fragment}
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95 translate-y-2"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 translate-y-2"
              >
                <Menu.Items
                  className="absolute right-0 mt-2 w-44 origin-top-right bg-neutral-800 text-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  static
                >
                  <div className="py-2 text-sm">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/my-wallet"
                          className={`block px-4 py-2 ${active ? 'bg-neutral-700' : ''}`}
                        >
                          My Wallet
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/my-followers"
                          className={`block px-4 py-2 ${active ? 'bg-neutral-700' : ''}`}
                        >
                          My Followers
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/my-following"
                          className={`block px-4 py-2 ${active ? 'bg-neutral-700' : ''}`}
                        >
                          Following
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/my-matches"
                          className={`block px-4 py-2 ${active ? 'bg-neutral-700' : ''}`}
                        >
                          My Matches
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/my-addresses"
                          className={`block px-4 py-2 ${active ? 'bg-neutral-700' : ''}`}
                        >
                          My Addresses
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/my-reviews"
                          className={`block px-4 py-2 ${active ? 'bg-neutral-700' : ''}`}
                        >
                          My Reviews
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={onLogout}
                          className={`block text-red-500 w-full text-left px-4 py-2 ${active ? 'bg-neutral-700' : ''}`}
                        >
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      )}
    </nav>
  )
}
