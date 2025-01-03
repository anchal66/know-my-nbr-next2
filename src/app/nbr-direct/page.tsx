'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import FilterModal from '@/components/FilterModal'

import {
  searchUsers,
  searchCitiesWithCounts,
  getGenders,
  NbrUser
} from '@/lib/nbrDirect'

import { UserDetailResponse } from '@/lib/user'
import UserCardVIP from '@/components/nbr-direct/UserCardVIP'
import UserCardNormal from '@/components/nbr-direct/UserCardNormal'
import UserCardFeatured from '@/components/nbr-direct/UserCardFeatured'

// Example filter icon
import { FaFilter } from 'react-icons/fa'

interface FilterData {
  orientationIds?: number[]
  hairColorIds?: number[]
  nationalityIds?: number[]
  ageMin?: number
  ageMax?: number
  name?: string
}

export default function NbrDirectPage() {
  const userDetail: UserDetailResponse | null = useSelector(
    (state: RootState) => state.user.detail
  )

  // =================== State ===================
  const [citySearchTerm, setCitySearchTerm] = useState('')
  const [citySuggestions, setCitySuggestions] = useState<
    { cityId: string; label: string }[]
  >([])
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null)
  const [selectedCityName, setSelectedCityName] = useState<string>('')

  const [genders, setGenders] = useState<{ id: number; name: string }[]>([])
  const [selectedGenderId, setSelectedGenderId] = useState<number | null>(null)

  const [modalFilters, setModalFilters] = useState<FilterData>({})
  const [showFilterModal, setShowFilterModal] = useState(false)

  const [userList, setUserList] = useState<NbrUser[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(false)

  // Pagination states
  const [page, setPage] = useState(0)
  const size = 10 // constant page size
  const totalPages = totalUsers > 0 ? Math.ceil(totalUsers / size) : 1

  // =================== Effects ===================

  /** 1) Initialize city from user’s location if present */
  useEffect(() => {
    if (userDetail && userDetail.locations.length > 0) {
      const activeLoc = userDetail.locations.find((loc) => loc.isActive)
      if (activeLoc) {
        setSelectedCityId(activeLoc.city.id)
        setSelectedCityName(activeLoc.city.name)
      }
    }
  }, [userDetail])

  /** 2) Load Genders (for dropdown) */
  useEffect(() => {
    getGenders()
      .then((data) => setGenders(data))
      .catch((err) => console.error('Error loading genders:', err))
  }, [])

  /** 3) Type-ahead for city search */
  useEffect(() => {
    if (citySearchTerm.length < 2) {
      setCitySuggestions([])
      return
    }

    let isCancelled = false
    searchCitiesWithCounts(citySearchTerm)
      .then((res: any) => {
        if (isCancelled) return
        const content = res.content || []
        const mapped = content.map((c: any) => ({
          cityId: c.cityId,
          label: `${c.city}, ${c.state}, ${c.country} (${c.userCount})`,
        }))
        setCitySuggestions(mapped)
      })
      .catch((err) => console.error('City search error:', err))

    return () => {
      isCancelled = true
    }
  }, [citySearchTerm])

  /**
   * 4) Whenever cityId or any filter changes => do search
   * Also reset the page to 0 if city/gender/filters changed
   */
  useEffect(() => {
    setPage(0)
  }, [
    selectedCityId,
    selectedGenderId,
    modalFilters.orientationIds,
    modalFilters.hairColorIds,
    modalFilters.nationalityIds,
    modalFilters.ageMin,
    modalFilters.ageMax,
    modalFilters.name,
  ])

  useEffect(() => {
    // If no city selected, clear
    if (!selectedCityId) {
      setUserList([])
      setTotalUsers(0)
      return
    }
    async function doSearch() {
      setLoading(true)
      try {
        const resp = await searchUsers({
          cityId: selectedCityId!,
          genderIds: selectedGenderId ? [selectedGenderId] : undefined,
          orientationIds: modalFilters.orientationIds,
          hairColorIds: modalFilters.hairColorIds,
          nationalityIds: modalFilters.nationalityIds,
          ageMin: modalFilters.ageMin,
          ageMax: modalFilters.ageMax,
          name: modalFilters.name,
          page,
          size,
        })
        setUserList(resp.users)
        setTotalUsers(resp.total)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    doSearch()
  }, [
    selectedCityId,
    selectedGenderId,
    modalFilters.orientationIds,
    modalFilters.hairColorIds,
    modalFilters.nationalityIds,
    modalFilters.ageMin,
    modalFilters.ageMax,
    modalFilters.name,
    page,
    size,
  ])

  // =================== Handlers ===================

  /** 5) When user picks a city from suggestions */
  function handlePickCity(cityId: string, label: string) {
    setSelectedCityId(cityId)
    setSelectedCityName(label)
    setCitySearchTerm('')
    setCitySuggestions([])
  }

  /** 6) Handler for FilterModal “Apply” */
  function handleApplyFilters(newFilters: FilterData) {
    setModalFilters(newFilters)
    setShowFilterModal(false)
  }

  // =================== Render ===================

  return (
    <div className="min-h-screen bg-neutral-900 text-brand-white p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Page Title */}
        <h1 className="text-2xl font-semibold text-brand-gold">NBR Direct</h1>

        {/**
          =======================
          MOBILE VIEW (<md)
          =======================
        */}
        <div className="md:hidden">
          {/* ============ LINE 1: Search Box ============ */}
          <div className="relative mb-2">
            <label
              className="block font-medium text-sm text-gray-300 mb-1"
              htmlFor="city-search"
            >
              Type your city
            </label>
            <Input
              placeholder="Type at least 2 chars..."
              value={citySearchTerm}
              onChange={(e) => setCitySearchTerm(e.target.value)}
              className="bg-neutral-800 border border-gray-700 text-gray-200 w-full"
            />
            {citySuggestions.length > 0 && (
              <div className="absolute z-10 top-full left-0 w-full bg-neutral-800 border border-gray-700 shadow-md max-h-48 overflow-auto">
                {citySuggestions.map((c) => (
                  <div
                    key={c.cityId}
                    className="p-2 hover:bg-neutral-700 cursor-pointer"
                    onClick={() => handlePickCity(c.cityId, c.label)}
                  >
                    {c.label}
                  </div>
                ))}
              </div>
            )}
            {selectedCityId && (
              <p className="text-green-400 text-sm mt-1">
                Selected City: {selectedCityName}
              </p>
            )}
          </div>

          {/* ============ LINE 2: Gender + Filter Button ============ */}
          <div className="flex items-center gap-2">
            <select
              className="border border-gray-700 bg-neutral-800 text-gray-200 rounded px-3 py-2"
              value={selectedGenderId ?? ''}
              onChange={(e) => {
                const val = e.target.value
                setSelectedGenderId(val ? Number(val) : null)
              }}
            >
              <option value="">Gender</option>
              {genders.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            <Button
              variant="secondary"
              className="border-gray-700 text-gray-200 hover:bg-neutral-700 flex items-center justify-center px-3 py-2"
              onClick={() => setShowFilterModal(true)}
            >
              <FaFilter className="text-lg" />
            </Button>
          </div>
        </div>

        {/**
          =======================
          DESKTOP/WIDE VIEW (md+)
          =======================
        */}
        <div className="hidden md:block">
          <div className="flex items-center gap-4">
            {/* Search Box */}
            <div className="flex-1">
              <label
                className="block font-medium text-sm text-gray-300 mb-1"
                htmlFor="city-search"
              >
                Type your city
              </label>
              <div className="relative">
                <Input
                  id="city-search"
                  placeholder="Type at least 2 chars..."
                  value={citySearchTerm}
                  onChange={(e) => setCitySearchTerm(e.target.value)}
                  className="bg-neutral-800 border border-gray-700 text-gray-200 w-full"
                />
                {citySuggestions.length > 0 && (
                  <div className="absolute z-10 top-full left-0 w-full bg-neutral-800 border border-gray-700 shadow-md max-h-48 overflow-auto">
                    {citySuggestions.map((c) => (
                      <div
                        key={c.cityId}
                        className="p-2 hover:bg-neutral-700 cursor-pointer"
                        onClick={() => handlePickCity(c.cityId, c.label)}
                      >
                        {c.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedCityId && (
                <p className="text-green-400 text-sm mt-1">
                  Selected City: {selectedCityName}
                </p>
              )}
            </div>

            {/* Gender Dropdown */}
            <div className="flex items-center">
              <label className="sr-only" htmlFor="gender-select">
                Gender
              </label>
              <select
                id="gender-select"
                className="border border-gray-700 bg-neutral-800 text-gray-200 rounded px-3 py-2"
                value={selectedGenderId ?? ''}
                onChange={(e) => {
                  const val = e.target.value
                  setSelectedGenderId(val ? Number(val) : null)
                }}
              >
                <option value="">Gender</option>
                {genders.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Icon Button */}
            <div className="flex items-center">
              <Button
                variant="secondary"
                className="border-gray-700 text-gray-200 hover:bg-neutral-700 flex items-center justify-center px-3 py-2"
                onClick={() => setShowFilterModal(true)}
              >
                <FaFilter className="text-lg" />
              </Button>
            </div>
          </div>
        </div>

        {/* 
          ========================
          SEARCH RESULTS / LIST
          ========================
        */}
        <div className="mt-4">
          {loading ? (
            <p className="text-gray-400">Loading results...</p>
          ) : (
            <p className="text-gray-300">Total results: {totalUsers}</p>
          )}

          {!loading && userList.length === 0 ? (
            <p className="text-gray-400">No users found</p>
          ) : (
            <ul className="space-y-2 mt-2">
              {userList.map((user: NbrUser) => {
                // Check if user is VIP
                if (user.isVIP) {
                  return (
                    <UserCardVIP
                      key={user.userId}
                      user={{
                        ...user,
                        hearts: user.heartReceivedCount,
                        comments: user.commentsCount,
                        followers: user.followersCount,
                        matches: user.matchesCount
                      }}
                    />
                  )
                }
                // Check if user is Featured
                if (user.isFeatured) {
                  return (
                    <UserCardFeatured
                      key={user.userId}
                      user={{
                        ...user,
                        hearts: user.heartReceivedCount,
                        comments: user.commentsCount,
                        followers: user.followersCount,
                        matches: user.matchesCount
                      }}
                    />
                  )
                }
                // Otherwise normal
                return (
                  <UserCardNormal
                    key={user.userId}
                    user={{
                      ...user,
                      hearts: user.heartReceivedCount,
                      comments: user.commentsCount,
                      followers: user.followersCount,
                      matches: user.matchesCount
                    }}
                  />
                )
              })}
            </ul>
          )}
        </div>

        {/* Pagination controls */}
        {!loading && userList.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={page === 0}
              className='bg-brand-gold text-black hover:brightness-110'
            >
              Previous
            </Button>
            <span className="text-gray-300">
              Page {page + 1} / {totalPages}
            </span>
            <Button
              onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={page + 1 === totalPages}
              className='bg-brand-gold text-black hover:brightness-110'
            >
              Next
            </Button>
          </div>
        )}

        {/* Filter Modal */}
        {showFilterModal && (
          <FilterModal
            onClose={() => setShowFilterModal(false)}
            onApply={handleApplyFilters}
            initialFilters={modalFilters}
          />
        )}
      </div>
    </div>
  )
}
