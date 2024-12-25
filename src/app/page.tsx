// src/app/page.tsx

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import {
  loadFilters,
  saveFilters,
  defaultFilters,
  SwipeFilters
} from '@/lib/filters'
import {
  fetchGenders,
  fetchOrientations,
  fetchSwipableUsers,
  recordSwipe,
  OptionItem,
  SwipeCardUser,
  calculateAge
} from '@/lib/swipeService'

import TinderCard from 'react-tinder-card'
import { FaSlidersH } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import FilterModal from '../components/SwipeFilterModal'
import MatchModal from '../components/MatchModel'
import Image from 'next/image'

/** Local type for react-tinder-card references */
export interface CustomTinderCardRef {
  swipe: (dir?: SwipeDirection) => Promise<void>
  restoreCard: () => Promise<void>
}

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

export default function HomePage() {
  const { token } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  // Filter & user data
  const [genders, setGenders] = useState<OptionItem[]>([])
  const [orientations, setOrientations] = useState<OptionItem[]>([])
  const [cards, setCards] = useState<SwipeCardUser[]>([])

  // Filter state
  const [filters, setFilters] = useState<SwipeFilters>(defaultFilters)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [firstLoad, setFirstLoad] = useState(true)

  // Match modal
  const [matchModalOpen, setMatchModalOpen] = useState(false)
  const [matchId, setMatchId] = useState<string | null>(null)

  // Track the top card
  const [currentIndex, setCurrentIndex] = useState(-1)

  /**
   * We'll create a ref for each TinderCard so we can programmatically swipe them
   * when the user clicks "Like" or "Nope" buttons.
   */
  const childRefs = useRef<React.RefObject<CustomTinderCardRef>[]>([])

  useEffect(() => {

    // Load filter from cookies
    const loaded = loadFilters()
    setFilters(loaded)

    // If exactly default => open filter modal on first time
    if (JSON.stringify(loaded) === JSON.stringify(defaultFilters)) {
      setShowFilterModal(true)
    }

    // Fetch Genders & Orientations in parallel
    Promise.all([fetchGenders(), fetchOrientations()])
      .then(([gendersData, orientationsData]) => {
        setGenders(gendersData)
        setOrientations(orientationsData)
      })
      .catch((err) => console.error('Error fetching genders/orientations:', err))

    setFirstLoad(false)
  }, [token, router])

  // Whenever filters change (except first load), fetch new swipable users
  useEffect(() => {
    if (!firstLoad) {
      fetchUsersForSwipe()
    }
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchUsersForSwipe() {
    try {
      const data = await fetchSwipableUsers({
        distancePreference: filters.distancePreference,
        ageMin: filters.ageMin,
        ageMax: filters.ageMax,
        genderIds: filters.genderIds,
        orientationIds: filters.orientationIds,
        page: 0,
        size: 10
      })
      setCards(data)
      setCurrentIndex(data.length - 1)

      // Create references for each card using the custom interface
      childRefs.current = data.map(() => React.createRef<CustomTinderCardRef>())
    } catch (err) {
      console.error('Failed to fetch swipable users:', err)
    }
  }

  /** On top card swiped => record in backend, remove from UI, etc. */
  const handleSwipe = async (
    direction: SwipeDirection,
    user: SwipeCardUser,
    index: number
  ) => {
    if (index !== currentIndex) return // Only handle the top card

    try {
      const response = await recordSwipe(
        direction === 'left' ? 'DISLIKE' : 'LIKE',
        user.id
      )
      if (response.match) {
        // It's a match
        setMatchId(response.matchId)
        setMatchModalOpen(true)
      }
      // Remove card locally
      setCards((prev) => prev.filter((c) => c.id !== user.id))
      setCurrentIndex((prev) => prev - 1)
    } catch (err) {
      console.error('Error recording swipe:', err)
    }
  }

  /** Programmatically trigger a swipe on the top card. */
  const swipe = async (dir: 'left' | 'right') => {
    if (currentIndex < 0) return
    const cardRef = childRefs.current[currentIndex]
    if (cardRef?.current) {
      await cardRef.current.swipe(dir) // triggers handleSwipe
    }
  }

  function handleOpenFilters() {
    setShowFilterModal(true)
  }

  function handleFiltersUpdated(updated: SwipeFilters) {
    if (updated.ageMax < updated.ageMin) {
      updated.ageMax = updated.ageMin + 1
    }
    setFilters(updated)
    saveFilters(updated)
  }

  return (
    <div className="relative w-full h-screen flex flex-col bg-gradient-to-b from-blue-50 to-indigo-100">
      {/* Filter gear button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleOpenFilters}
          className="bg-white rounded-full p-3 border border-gray-300 shadow hover:shadow-md"
        >
          <FaSlidersH size={20} className="text-gray-700" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-4">
        {cards.length === 0 ? (
          // No cards
          <div className="text-center bg-white p-6 rounded shadow-md max-w-sm w-full">
            <h2 className="text-xl font-bold mb-2">No Users Found</h2>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or check back later.
            </p>
            <Button variant="default" onClick={handleOpenFilters}>
              Adjust Filters
            </Button>
          </div>
        ) : (
          // Cards container
          <div className="relative w-full max-w-sm h-[550px]">
            {cards.map((user, index) => (
              <TinderCard
                ref={childRefs.current[index]}
                key={`${user.id}-${index}`} // Ensure unique key
                className="absolute w-full h-full"
                onSwipe={(dir) =>
                  handleSwipe(dir as SwipeDirection, user, index)
                }
                preventSwipe={['up', 'down']}
              >
                <SwipeCard user={user} />
              </TinderCard>
            ))}
          </div>
        )}
      </div>

      {/* Bottom LIKE/NOPE buttons */}
      {cards.length > 0 && (
        <div className="flex justify-center items-center gap-6 mb-6">
          <button
            onClick={() => swipe('left')}
            className="bg-white w-16 h-16 rounded-full flex items-center justify-center shadow hover:shadow-lg text-red-500 text-xl font-semibold transition-transform hover:scale-105"
          >
            NOPE
          </button>
          <button
            onClick={() => swipe('right')}
            className="bg-white w-16 h-16 rounded-full flex items-center justify-center shadow hover:shadow-lg text-green-500 text-xl font-semibold transition-transform hover:scale-105"
          >
            LIKE
          </button>
        </div>
      )}

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
        <MatchModal matchId={matchId} onClose={() => setMatchModalOpen(false)} />
      )}
    </div>
  )
}

/** Card with multiple images. */
function SwipeCard({ user }: { user: SwipeCardUser }) {
  const router = useRouter()
  const [imageIndex, setImageIndex] = useState(0)
  const media = (user as any).media || []

  const age = calculateAge(user.dateOfBirth);

  const handleImageClick = () => {
    if (media.length > 0) {
      setImageIndex((prev) => (prev + 1) % media.length)
    }
  }

  const handleNameClick = () => {
    // Navigate to /{username}
    router.push(`/${user.name}`)
  }

  return (
    <div className="w-full h-full rounded-xl bg-white shadow-lg overflow-hidden flex flex-col">
      {/* Image area */}
      <div className="relative flex-1" onClick={handleImageClick}>
        {media.length > 0 ? (
          <Image
            src={media[imageIndex].url}
            alt="User"
            fill
            className="object-cover cursor-pointer"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600 text-sm">No photos</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1">
        <h3
          className="text-xl text-black font-semibold cursor-pointer hover:underline"
          onClick={handleNameClick}
        >
          {user.name}, age: {age}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {user.bio || 'No bio available.'}
        </p>
        {typeof user.distance === 'number' && (
          <p className="text-sm text-gray-500 mb-2">
            ~{user.distance} km away
          </p>
        )}
      </div>
    </div>
  )
}
