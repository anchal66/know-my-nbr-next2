'use client'

// Force dynamic if needed
export const dynamic = 'force-dynamic'

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
  calculateAge,
  fetchMatches,
  OptionItem,
  SwipeCardUser
} from '@/lib/swipeService'
import { getConversations } from '@/lib/conversations'

import Image from 'next/image'
import { FaSlidersH } from 'react-icons/fa'

import FilterModal from '../components/SwipeFilterModal'
import MatchModal from '../components/MatchModel'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const { onBoardingStatus, token } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  // -------------------
  //  STATE
  // -------------------
  // Filters & data
  const [filters, setFilters] = useState<SwipeFilters>(defaultFilters)
  const [genders, setGenders] = useState<OptionItem[]>([])
  const [orientations, setOrientations] = useState<OptionItem[]>([])
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [firstLoad, setFirstLoad] = useState(true)

  // Swipe cards
  const [cards, setCards] = useState<SwipeCardUser[]>([])
  // We'll track the currently-animating card's ID (to add tailwind classes)
  const [animatingCardId, setAnimatingCardId] = useState<string | null>(null)
  const [animDirection, setAnimDirection] = useState<'left' | 'right' | null>(null)

  // Match modal
  const [matchModalOpen, setMatchModalOpen] = useState(false)
  const [matchId, setMatchId] = useState<string | null>(null)

  // For left side tabs
  type TabType = 'matches' | 'chats'
  const [activeTab, setActiveTab] = useState<TabType>('matches')

  // Matches list
  const [matchPage, setMatchPage] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  // Chats list
  const [chatPage, setChatPage] = useState<any>(null)
  const [chats, setChats] = useState<any[]>([])

  // Loading states
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [loadingChats, setLoadingChats] = useState(false)

  // -------------------
  //  EFFECTS
  // -------------------
  useEffect(() => {
    // Onboarding check
    if (token) {
      if (onBoardingStatus === 'LOCATION') {
        router.push('/onboarding/location')
        return
      }
      if (onBoardingStatus === 'MEDIA_UPLOADED') {
        router.push('/onboarding/media')
        return
      }
      if (onBoardingStatus === 'PRIVATE_CONTACT') {
        router.push('/onboarding/private-data')
        return
      }
      if (onBoardingStatus === 'EMPTY' || onBoardingStatus === 'PROFILE') {
        router.push('/onboarding/profile')
        return
      }
      if (onBoardingStatus !== 'FINISHED') {
        router.push('/onboarding/profile')
        return
      }
    }

    // Load filters
    const loaded = loadFilters()
    setFilters(loaded)

    if (JSON.stringify(loaded) === JSON.stringify(defaultFilters)) {
      setShowFilterModal(true)
    }

    // Fetch Genders & Orientations
    Promise.all([fetchGenders(), fetchOrientations()])
      .then(([gendersData, orientationsData]) => {
        setGenders(gendersData)
        setOrientations(orientationsData)
      })
      .catch((err) => console.error('Error fetching genders/orientations:', err))

    setFirstLoad(false)

    // Also fetch left side data
    fetchInitialMatches()
    fetchInitialChats()
  }, [token, router])

  // Whenever filters change (except first load), fetch new swipable users
  useEffect(() => {
    if (!firstLoad) {
      fetchUsersForSwipe()
    }
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  // -------------------
  //  FETCHING
  // -------------------
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
      setCards(Array.isArray(data) ? data : [])
      // Reset animation
      setAnimatingCardId(null)
      setAnimDirection(null)
    } catch (err) {
      console.error('Failed to fetch swipable users:', err)
      setCards([])
    }
  }

  async function fetchInitialMatches(page = 0) {
    try {
      setLoadingMatches(true)
      const data = await fetchMatches(page, 20)
      setMatchPage(data)
      setMatches(Array.isArray(data?.content) ? data.content : [])
    } catch (error) {
      console.error('Error fetching matches:', error)
      setMatches([])
    } finally {
      setLoadingMatches(false)
    }
  }

  async function fetchInitialChats(page = 0) {
    try {
      setLoadingChats(true)
      const data = await getConversations(page, 20)
      setChatPage(data)
      setChats(Array.isArray(data?.content) ? data.content : [])
    } catch (error) {
      console.error('Error fetching chats:', error)
      setChats([])
    } finally {
      setLoadingChats(false)
    }
  }

  // -------------------
  //  SWIPE HANDLERS
  // -------------------
  async function handleNopeCard() {
    if (cards.length === 0 || animatingCardId) return

    const topUser = cards[0]
    // Animate it
    setAnimatingCardId(topUser.id)
    setAnimDirection('left')

    // Wait for animation to finish (e.g., ~500ms)
    setTimeout(async () => {
      // Record the swipe
      try {
        const response = await recordSwipe('DISLIKE', topUser.id)
        // remove card from array
        setCards((prev) => prev.slice(1))
      } catch (err) {
        console.error('Error recording swipe:', err)
      }
      // Reset animation
      setAnimatingCardId(null)
      setAnimDirection(null)
    }, 400)
  }

  async function handleLikeCard() {
    if (cards.length === 0 || animatingCardId) return

    const topUser = cards[0]
    // Animate it
    setAnimatingCardId(topUser.id)
    setAnimDirection('right')

    setTimeout(async () => {
      try {
        const response = await recordSwipe('LIKE', topUser.id)
        if (response.match) {
          setMatchId(response.matchId)
          setMatchModalOpen(true)
        }
        // remove card from array
        setCards((prev) => prev.slice(1))
      } catch (err) {
        console.error('Error recording swipe:', err)
      }
      // Reset animation
      setAnimatingCardId(null)
      setAnimDirection(null)
    }, 400)
  }

  // -------------------
  //  OTHER HANDLERS
  // -------------------
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

  // Clicking a match or chat => navigate to messages
  function handleNavigateToMessages(matchId: string) {
    router.push(`/messages?matchId=${matchId}`)
  }

  // Tab Switch
  function handleTabSwitch(tab: TabType) {
    setActiveTab(tab)
  }

  // Matches pagination
  async function handleMatchesNext() {
    if (loadingMatches || !matchPage || matchPage.last) return
    const nextPage = matchPage.number + 1
    fetchInitialMatches(nextPage)
  }
  async function handleMatchesPrev() {
    if (loadingMatches || !matchPage || matchPage.first) return
    const prevPage = matchPage.number - 1
    if (prevPage >= 0) fetchInitialMatches(prevPage)
  }

  // Chats pagination
  async function handleChatsNext() {
    if (loadingChats || !chatPage || chatPage.last) return
    const nextPage = chatPage.number + 1
    fetchInitialChats(nextPage)
  }
  async function handleChatsPrev() {
    if (loadingChats || !chatPage || chatPage.first) return
    const prevPage = chatPage.number - 1
    if (prevPage >= 0) fetchInitialChats(prevPage)
  }

  // -------------------
  //  RENDER
  // -------------------
  return (
    <div className="w-full h-screen bg-neutral-900 text-brand-white overflow-hidden">
      <div className="flex flex-col md:flex-row h-full">

        {/* LEFT SIDE (desktop only) */}
        <div className="hidden md:flex md:flex-col w-1/3 h-full bg-neutral-800 border-r border-gray-700 p-4">
          {/* Tabs */}
          <div className="flex gap-4 mb-4">
            <button
              className={`
                px-4 py-2 rounded-md font-semibold transition-colors
                ${activeTab === 'matches'
                  ? 'bg-brand-gold text-black'
                  : 'text-gray-300 hover:bg-neutral-700'
                }
              `}
              onClick={() => handleTabSwitch('matches')}
            >
              Matches
            </button>
            <button
              className={`
                px-4 py-2 rounded-md font-semibold transition-colors
                ${activeTab === 'chats'
                  ? 'bg-brand-gold text-black'
                  : 'text-gray-300 hover:bg-neutral-700'
                }
              `}
              onClick={() => handleTabSwitch('chats')}
            >
              Chats
            </button>
          </div>

          {/* Content for each tab */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'matches' ? (
              <div>
                {loadingMatches && (
                  <p className="text-sm text-gray-400">Loading matches...</p>
                )}
                {matches.map((m) => {
                  const firstMedia = m.media?.[0]?.url || '/no-image.png'
                  return (
                    <div
                      key={m.matchId}
                      className="flex items-center gap-3 mb-3 p-2 rounded hover:bg-neutral-700 cursor-pointer"
                      onClick={() => handleNavigateToMessages(m.matchId)}
                    >
                      <div className="w-12 h-12 relative flex-shrink-0">
                        <Image
                          src={firstMedia}
                          alt="Avatar"
                          fill
                          className="object-cover rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-brand-white">
                          {m.name}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-1">
                          {m.bio || 'No bio'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div>
                {loadingChats && (
                  <p className="text-sm text-gray-400">Loading chats...</p>
                )}
                {chats.map((c) => {
                  const lastMsg = c.recentMessages?.[0]
                  return (
                    <div
                      key={c.matchId}
                      className="flex flex-col mb-3 p-2 rounded hover:bg-neutral-700 cursor-pointer"
                      onClick={() => handleNavigateToMessages(c.matchId)}
                    >
                      <p className="font-semibold text-brand-white">
                        {c.name}
                      </p>
                      {lastMsg ? (
                        <span className="text-xs text-gray-400 truncate">
                          {lastMsg.content}
                        </span>
                      ) : (
                        <span className="text-xs text-brand-gold">
                          No messages yet
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex gap-2">
            {activeTab === 'matches' ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleMatchesPrev}
                  disabled={loadingMatches || matchPage?.first}
                  className="border-gray-600 text-gray-300 hover:bg-neutral-700"
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  onClick={handleMatchesNext}
                  disabled={loadingMatches || matchPage?.last}
                  className="border-gray-600 text-gray-300 hover:bg-neutral-700"
                >
                  Next
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleChatsPrev}
                  disabled={loadingChats || chatPage?.first}
                  className="border-gray-600 text-gray-300 hover:bg-neutral-700"
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  onClick={handleChatsNext}
                  disabled={loadingChats || chatPage?.last}
                  className="border-gray-600 text-gray-300 hover:bg-neutral-700"
                >
                  Next
                </Button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Cards Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Filter gear button in top-right */}
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={handleOpenFilters}
              className="bg-neutral-800 rounded-full p-3 border border-gray-600 shadow hover:shadow-lg transition-colors hover:bg-neutral-700"
            >
              <FaSlidersH size={20} className="text-gray-300" />
            </button>
          </div>

          {/* Card Container */}
          <div className="relative w-full max-w-sm h-[560px] flex items-center justify-center">
            {/* If no cards => show "No Users Found" */}
            {cards.length === 0 ? (
              <div className="text-center bg-neutral-800 border border-gray-700 p-6 rounded shadow-md w-full h-full flex flex-col justify-center items-center">
                <h2 className="text-xl font-bold text-brand-gold mb-2">
                  No Users Found
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  Try adjusting your filters or check back later.
                </p>
                <Button
                  variant="default"
                  onClick={handleOpenFilters}
                  className="bg-brand-gold text-black hover:brightness-110"
                >
                  Adjust Filters
                </Button>
              </div>
            ) : (
              // Show the top card only (cards[0])
              <div className="relative w-full h-full overflow-hidden">
                {cards.slice(0, 1).map((user) => (
                  <SwipeCard
                    key={user.id}
                    user={user}
                    isAnimating={animatingCardId === user.id}
                    animDirection={animDirection}
                  />
                ))}
              </div>
            )}

            {/* Bottom LIKE/NOPE buttons */}
            {cards.length > 0 && (
              <div className="absolute bottom-16 left-0 right-0 flex justify-center items-center gap-5">
                <button
                  onClick={handleNopeCard}
                  className="p-8 bg-neutral-800 w-14 h-14 rounded-full flex items-center justify-center shadow hover:shadow-lg text-brand-red text-lg font-semibold transition-transform hover:scale-105 border border-gray-600"
                >
                  NOPE
                </button>
                <button
                  onClick={handleLikeCard}
                  className="p-8 bg-neutral-800 w-14 h-14 rounded-full flex items-center justify-center shadow hover:shadow-lg text-brand-gold text-lg font-semibold transition-transform hover:scale-105 border border-gray-600"
                >
                  LIKE
                </button>
              </div>
            )}
          </div>
        </div>
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
        <MatchModal matchId={matchId} onClose={() => setMatchModalOpen(false)} />
      )}
    </div>
  )
}

// ---------------------------
// SWIPE CARD (Single card)
// ---------------------------
function SwipeCard({
  user,
  isAnimating,
  animDirection
}: {
  user: SwipeCardUser
  isAnimating: boolean
  animDirection: 'left' | 'right' | null
}) {
  const router = useRouter()
  const [imageIndex, setImageIndex] = useState(0)

  const media = (user as any).media || []
  const age = calculateAge(user.dateOfBirth)

  const handleImageClick = () => {
    if (media.length > 0) {
      setImageIndex((prev) => (prev + 1) % media.length)
    }
  }

  const handleNameClick = () => {
    router.push(`/${user.name}`)
  }

  return (
    <div
      className={`
        w-full h-full rounded-xl bg-neutral-800 text-brand-white
        shadow-lg overflow-hidden flex flex-col border border-gray-700
        transition-transform duration-300
        ${isAnimating && animDirection === 'left' ? 'translate-x-[-100vw] opacity-0' : ''}
        ${isAnimating && animDirection === 'right' ? 'translate-x-[100vw] opacity-0' : ''}
      `}
    >
      {/* Image area */}
      <div className="relative flex-1 cursor-pointer" onClick={handleImageClick}>
        {media.length > 0 ? (
          <Image
            src={media[imageIndex].url}
            alt="User"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No photos</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 relative">
        <h3
          className="text-base font-semibold cursor-pointer hover:underline truncate"
          onClick={handleNameClick}
        >
          {user.name}, {age}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-1 overflow-ellipsis overflow-hidden">
          {user.bio || 'No bio available.'}
        </p>
        {typeof user.distance === 'number' && (
          <p className="text-xs text-gray-500 mt-1">
            ~{user.distance} km away
          </p>
        )}
      </div>
    </div>
  )
}
