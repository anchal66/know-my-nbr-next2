'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import Link from 'next/link'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export function Header() {
  const { username, token } = useSelector((state: RootState) => state.auth)
  const userDetail = useSelector((state: RootState) => state.user.detail)

  const isLoggedIn = !!token && username

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
              <Select onValueChange={() => {}} >
                <SelectTrigger className="w-32" disabled>
                  <SelectValue placeholder="Other Cities" />
                </SelectTrigger>
                <SelectContent>
                  {otherCities.map((city, idx) => (
                    <SelectItem key={idx} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ) : (
          <div className="text-gray-500 italic">Not Logged In</div>
        )}
      </div>

      {/* Right side reserved for future */}
      <div className="flex items-center space-x-4">
        {/* Future top-right icons */}
      </div>
    </header>
  )
}
