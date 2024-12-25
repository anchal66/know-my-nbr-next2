// src/app/nbr-direct/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import FilterModal from '../../components/FilterModal'

import { searchUsers, searchCitiesWithCounts, getGenders } from '@/lib/nbrDirect'
import { UserDetailResponse } from '@/lib/user'

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

  // City search
  const [citySearchTerm, setCitySearchTerm] = useState('')
  const [citySuggestions, setCitySuggestions] = useState<
    { cityId: number; label: string }[]
  >([])
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null)
  const [selectedCityName, setSelectedCityName] = useState<string>('')

  // Gender dropdown
  const [genders, setGenders] = useState<{ id: number; name: string }[]>([])
  const [selectedGenderId, setSelectedGenderId] = useState<number | null>(null)

  // All other filters in a modal
  const [modalFilters, setModalFilters] = useState<FilterData>({})
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Search result states
  const [userList, setUserList] = useState<any[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(false)

  /** ============= 1) Initialize city from user’s location if present ============= */
  useEffect(() => {
    if (userDetail && userDetail.locations.length > 0) {
      const activeLoc = userDetail.locations.find((loc) => loc.isActive)
      if (activeLoc) {
        setSelectedCityId(activeLoc.city.id)
        setSelectedCityName(activeLoc.city.name)
      }
    }
  }, [userDetail])

  /** ============= 2) Load Genders for the dropdown ============= */
  useEffect(() => {
    getGenders()
      .then((data) => setGenders(data))
      .catch((err) => console.error('Error loading genders:', err))
  }, [])

  /** ============= 3) Type-ahead for city search ============= */
  useEffect(() => {
    // Only search if 2+ chars
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

  /** ============= 4) Whenever any filter changes => do search ============= */
  useEffect(() => {
    if (!selectedCityId) {
      setUserList([])
      setTotalUsers(0)
      return
    }
    async function doSearch() {
      setLoading(true)
      try {
        // Combine all filters
        const resp = await searchUsers({
          cityId: selectedCityId!,
          genderIds: selectedGenderId ? [selectedGenderId] : undefined,
          orientationIds: modalFilters.orientationIds,
          hairColorIds: modalFilters.hairColorIds,
          nationalityIds: modalFilters.nationalityIds,
          ageMin: modalFilters.ageMin,
          ageMax: modalFilters.ageMax,
          name: modalFilters.name,
          page: 0,
          size: 20,
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
  ])

  /** ============= 5) Handler when user picks a city from suggestions ============= */
  function handlePickCity(cityId: number, label: string) {
    setSelectedCityId(cityId)
    setSelectedCityName(label)
    setCitySearchTerm('')
    setCitySuggestions([])
  }

  /** ============= 6) Handler for the FilterModal's “Apply” ============= */
  function handleApplyFilters(newFilters: FilterData) {
    setModalFilters(newFilters)
    setShowFilterModal(false)
  }

  // Render
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">NBR Direct</h1>

      {/* City + Gender on page, not in modal */}
      <div className="space-y-4">
        {/* City search */}
        <div className="relative">
          <label className="block font-medium mb-1 text-sm">
            Type your city
          </label>
          <Input
            placeholder="Type at least 2 chars..."
            value={citySearchTerm}
            onChange={(e) => setCitySearchTerm(e.target.value)}
          />
          {citySuggestions.length > 0 && (
            <div className="absolute z-10 top-full left-0 w-full bg-white border shadow-md max-h-48 overflow-auto">
              {citySuggestions.map((c) => (
                <div
                  key={c.cityId}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handlePickCity(c.cityId, c.label)}
                >
                  {c.label}
                </div>
              ))}
            </div>
          )}
          {selectedCityId && (
            <p className="text-green-600 text-sm mt-1">
              Selected City: {selectedCityName}
            </p>
          )}
        </div>

        {/* Gender dropdown */}
        <div>
          <label className="block font-medium mb-1 text-sm">Gender</label>
          <div className="inline-block">
            <select
              className="border rounded px-3 py-2"
              value={selectedGenderId ?? ''}
              onChange={(e) => {
                const val = e.target.value
                setSelectedGenderId(val ? Number(val) : null)
              }}
            >
              <option value="">Any</option>
              {genders.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter button for rest filters */}
      <Button variant="secondary" onClick={() => setShowFilterModal(true)}>
        Advanced Filters
      </Button>

      {/* Display results */}
      <div className="mt-4">
        {loading ? (
          <p>Loading results...</p>
        ) : (
          <p>Total results: {totalUsers}</p>
        )}

        {!loading && userList.length === 0 ? (
          <p>No users found</p>
        ) : (
          <ul className="space-y-2 mt-2">
            {userList.map((user) => (
              <li
                key={user.userId}
                className="border p-2 rounded flex items-center space-x-4"
              >
                <div className="w-16 h-16 relative rounded overflow-hidden">
                  {user.media && user.media.length > 0 ? (
                    <Image
                      src={
                        user.media.find((m: any) => m.orderNo === 1)?.url ||
                        user.media[0].url
                      }
                      alt={`${user.name}'s profile`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-300 flex items-center justify-center text-gray-600">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/${user.username}`}
                    className="font-semibold hover:underline"
                  >
                    {user.name} (@{user.username})
                  </Link>
                  <p>Age: {user.age}</p>
                  <p>
                    Gender: {user.gender.name} | Orientation:{' '}
                    {user.orientation.name}
                  </p>
                  <p>Nationality: {user.nationality.name}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApply={handleApplyFilters}
          initialFilters={modalFilters}
        />
      )}
    </div>
  )
}
