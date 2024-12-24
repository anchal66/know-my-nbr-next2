'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import { loadFilters, saveFilters, defaultFilters, SwipeFilters } from '@/lib/filters'
import {
  fetchGenders,
  fetchOrientations,
  fetchSwipableUsers,
  recordSwipe,
  OptionItem,
  SwipeCardUser,
} from '@/lib/swipeService'
import TinderCard from 'react-tinder-card'
import { FaSlidersH } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import FilterModal from '../components/SwipeFilterModal'
import MatchModal from '../components/MatchModel'
import Image from 'next/image'

export default function HomePage() {
  const { token } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  /** Data states */
  const [genders, setGenders] = useState<OptionItem[]>([])
  const [orientations, setOrientations] = useState<OptionItem[]>([])
  const [cards, setCards] = useState<SwipeCardUser[]>([]) // swipable users

  /** Filter state */
  const [filters, setFilters] = useState<SwipeFilters>(defaultFilters)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [firstLoad, setFirstLoad] = useState(true)

  // For "It's a match!" modal
  const [matchModalOpen, setMatchModalOpen] = useState(false)
  const [matchId, setMatchId] = useState<string | null>(null)

  useEffect(() => {
    // 1) If not logged in => redirect
    if (!token) {
      router.push('/login')
      return
    }

    // 2) Load Genders & Orientations
    Promise.all([fetchGenders(), fetchOrientations()])
      .then(([gendersData, orientationsData]) => {
        setGenders(gendersData)
        setOrientations(orientationsData)
      })
      .catch((err) => {
        console.error('Error fetching genders/orientations:', err)
      })

    // 3) Load filter from cookies
    const loaded = loadFilters()
    setFilters(loaded)

    // If it's exactly the defaultFilters => open filter modal on first time
    if (JSON.stringify(loaded) === JSON.stringify(defaultFilters)) {
      setShowFilterModal(true)
    }

    setFirstLoad(false)
  }, [token, router])

  // Whenever filters change (except the first load), fetch new swipable users
  useEffect(() => {
    if (!firstLoad) {
      fetchUsersForSwipe()
    }
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  /** Fetch users from /api/v1/swipes */
  async function fetchUsersForSwipe() {
    try {
      const data = await fetchSwipableUsers({
        distancePreference: filters.distancePreference,
        ageMin: filters.ageMin,
        ageMax: filters.ageMax,
        genderIds: filters.genderIds,
        orientationIds: filters.orientationIds,
        page: 0,
        size: 10,
      })
      setCards(data)
    } catch (err) {
      console.error('Failed to fetch swipable users:', err)
    }
  }

  /** Handle user swiping a card left or right */
  async function handleSwipe(direction: string, user: SwipeCardUser) {
    try {
      const response = await recordSwipe(direction === 'left' ? 'DISLIKE' : 'LIKE', user.userId)
      // response => { match: boolean, matchId: string }
      if (response.match) {
        // Open "It's a match" modal
        setMatchId(response.matchId)
        setMatchModalOpen(true)
      }

      // Remove the card locally:
      setCards((prev) => prev.filter((c) => c.userId !== user.userId))
    } catch (err) {
      console.error('Error recording swipe:', err)
    }
  }

  /** Gear Icon -> open modal */
  function handleOpenFilters() {
    setShowFilterModal(true)
  }

  /** Called after user updates the filters in modal */
  function handleFiltersUpdated(updated: SwipeFilters) {
    // enforce minAge <= maxAge
    if (updated.ageMax < updated.ageMin) {
      updated.ageMax = updated.ageMin + 1
    }
    setFilters(updated)
    saveFilters(updated)
  }

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* Gear icon button top-right */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleOpenFilters}
          className="text-gray-700 hover:text-gray-900 bg-white rounded-full p-3 border border-gray-300"
        >
          <FaSlidersH size={20} />
        </button>
      </div>

      {/* Cards Container */}
      <div className="relative w-full max-w-md h-[550px]">
        {cards.map((user) => (
          <TinderCard
            key={user.userId}
            className="absolute w-full h-full"
            onSwipe={(dir) => handleSwipe(dir, user)}
            preventSwipe={['up', 'down']} // only allow left, right
          >
            <SwipeCard user={user} />
          </TinderCard>
        ))}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          initialFilters={filters}
          genders={genders}
          orientations={orientations}
          onSave={handleFiltersUpdated}
        />
      )}

      {/* Match Modal */}
      {matchModalOpen && (
        <MatchModal
          matchId={matchId}
          onClose={() => setMatchModalOpen(false)}
        />
      )}
    </div>
  )
}

/** A sub-component that shows one user's profile card with multiple images */
function SwipeCard({ user }: { user: SwipeCardUser }) {
  const router = useRouter()
  const [imageIndex, setImageIndex] = useState(0)

  // If your API has an array of images in user.media
  const media = (user as any).media || []

  function handleImageClick() {
    // Show next image if multiple
    if (media.length > 0) {
      setImageIndex((prev) => (prev + 1) % media.length)
    }
  }

  function handleNameClick() {
    // Navigate to /{username} (assuming user.name is the username)
    router.push(`/${user.name}`)
  }

  return (
    <div className="w-full h-full rounded-xl bg-white shadow-md flex flex-col">
      {/* Top: Image area */}
      <div className="flex-1 relative" onClick={handleImageClick}>
        {media.length > 0 ? (
          <Image
            src={media[imageIndex].url}
            alt="User"
            fill
            className="object-cover rounded-t-xl cursor-pointer"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 rounded-t-xl flex items-center justify-center">
            <span className="text-gray-600 text-sm">No photos</span>
          </div>
        )}
      </div>

      {/* Bottom: Info area */}
      <div className="p-4 flex flex-col gap-1">
        <h3
          className="text-xl font-semibold cursor-pointer hover:underline"
          onClick={handleNameClick}
        >
          {user.name}, {user.age}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{user.bio}</p>
        {/* If there's distance, show it */}
        {typeof user.distance === 'number' && (
          <p className="text-sm text-gray-500 mb-2">~{user.distance} km away</p>
        )}
        {/* Example: you could show more fields like gender, orientation, etc. */}
      </div>
    </div>
  )
}
