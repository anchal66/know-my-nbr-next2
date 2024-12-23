// src/app/nbr-direct/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import { CityUserCount, searchUsers, getCityUserCounts } from '@/lib/nbrDirect'
import { UserDetailResponse } from '@/lib/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
import FilterModal from '../../components/FilterModal'
import Image from 'next/image'

export default function NbrDirectPage() {
  const userDetail: UserDetailResponse | null = useSelector((state: RootState) => state.user.detail)

  const [cityCounts, setCityCounts] = useState<CityUserCount[]>([])
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null)
  const [searchName, setSearchName] = useState('')
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Filter state
  const [genderIds, setGenderIds] = useState<number[] | undefined>()
  const [orientationIds, setOrientationIds] = useState<number[] | undefined>()
  const [hairColorIds, setHairColorIds] = useState<number[] | undefined>()
  const [nationalityIds, setNationalityIds] = useState<number[] | undefined>()
  const [ageMin, setAgeMin] = useState<number | undefined>()
  const [ageMax, setAgeMax] = useState<number | undefined>()

  // Result
  const [userList, setUserList] = useState<any[]>([])
  const [totalUsers, setTotalUsers] = useState(0)

  /** 1. Initialize default city to the user's active city */
  useEffect(() => {
    if (userDetail) {
      const activeLoc = userDetail.locations.find(loc => loc.isActive)
      if (activeLoc) {
        // we have cityId from userDetail or we have to match with cityCounts 
        // but your userDetail location doesn't show cityId in the snippet. 
        // Possibly you do: cityId= activeLoc.city.id
        setSelectedCityId(activeLoc.city.id)
      }
    }
  }, [userDetail])

  /** 2. Fetch city user counts for the dropdown */
  useEffect(() => {
    async function fetchCityCounts() {
      try {
        const data = await getCityUserCounts()
        setCityCounts(data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchCityCounts()
  }, [])

  /** 3. Perform search each time cityId, searchName, or filters change */
  useEffect(() => {
    if (!selectedCityId) return
    const fetchUsers = async () => {
      try {
        const resp = await searchUsers({
          cityId: selectedCityId,
          name: searchName || undefined,
          genderIds,
          hairColorIds,
          orientationIds,
          nationalityIds,
          ageMin,
          ageMax,
          page: 0,
          size: 20
        })
        setUserList(resp.users)
        setTotalUsers(resp.total)
      } catch (error) {
        console.error(error)
      }
    }
    fetchUsers()
  }, [selectedCityId, searchName, genderIds, orientationIds, hairColorIds, nationalityIds, ageMin, ageMax])

  /** Handle city selection */
  const handleSelectCity = (val: string) => {
    // val is the cityId as string
    setSelectedCityId(Number(val))
  }

  /** On search box submit */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // searchName is already in state, so search is triggered by useEffect
  }

  /** Handle filters from the modal */
  const handleApplyFilters = (filters: {
    genderIds?: number[],
    hairColorIds?: number[],
    orientationIds?: number[],
    nationalityIds?: number[],
    ageMin?: number,
    ageMax?: number
  }) => {
    setGenderIds(filters.genderIds)
    setOrientationIds(filters.orientationIds)
    setHairColorIds(filters.hairColorIds)
    setNationalityIds(filters.nationalityIds)
    setAgeMin(filters.ageMin)
    setAgeMax(filters.ageMax)
    setShowFilterModal(false)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">NBR Direct</h1>

      <form onSubmit={handleSearch} className="flex items-center space-x-4 mb-4">
        {/* City Dropdown */}
        <Select onValueChange={handleSelectCity} value={selectedCityId ? String(selectedCityId) : ''}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent>
            {cityCounts.map((c) => {
              const label = `${c.city}, ${c.country} (${c.userCount})`
              return (
                <SelectItem key={c.cityId} value={String(c.cityId)}>
                  {label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {/* Search by name */}
        <Input
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />

        <Button type="submit">Search</Button>

        <Button variant="secondary" onClick={() => setShowFilterModal(true)}>
          Filter
        </Button>
      </form>

      <div className="mb-2">
        Total results: {totalUsers}
      </div>

      {/* Results */}
      <div>
        {userList.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul className="space-y-2">
            {userList.map(user => (
              <li key={user.userId} className="border p-2 rounded flex items-center space-x-4">
                {/* Show a primary media (orderNo=1) for profile pic if available */}
                {user.media && user.media.length > 0 ? (
                  <div className="w-16 h-16 relative rounded">
                    <Image
                      src={user.media.find((m: any) => m.orderNo === 1)?.url || user.media[0].url}
                      alt={`${user.name}'s profile`}
                      fill
                      className="object-cover rounded"
                      priority={false}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center">No Image</div>
                )}
                <div>
                  <p><strong>{user.name}</strong> (@{user.username})</p>
                  <p>Age: {user.age}</p>
                  <p>Gender: {user.gender.name}, Orientation: {user.orientation.name}</p>
                  <p>Nationality: {user.nationality.name}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApply={handleApplyFilters}
        />
      )}
    </div>
  )
}
