'use client'

import { useEffect, useState } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { RootState, AppDispatch } from '@/state/store'
import { useDispatch, useSelector } from 'react-redux'
import { getUserDetails, changeUserLocation } from '@/lib/user'
import { setUserDetail } from '@/state/slices/userSlice'
import { LocationItem } from '@/lib/user'

export function CitySelector() {
  const dispatch = useDispatch<AppDispatch>()
  const { token } = useSelector((state: RootState) => state.auth)
  const userDetail = useSelector((state: RootState) => state.user.detail)

  const [selectedCity, setSelectedCity] = useState<string>('Unknown City')
  const [otherCities, setOtherCities] = useState<string[]>([])

  // Initialize city dropdown
  useEffect(() => {
    if (!token || !userDetail || userDetail.locations.length === 0) {
      setSelectedCity('Unknown City')
      setOtherCities([])
      return
    }

    const activeLoc = userDetail.locations.find((loc) => loc.isActive)
    setSelectedCity(activeLoc ? activeLoc.city.name : 'Unknown City')

    const inactive = userDetail.locations
      .filter((loc) => !loc.isActive)
      .map((loc) => loc.city.name)

    setOtherCities(inactive)
  }, [token, userDetail])

  async function handleCityChange(value: string) {
    // Only call API if the city has actually changed
    if (value === selectedCity) return

    if (!userDetail) return
    const newLocation = userDetail.locations.find(loc => loc.city.name === value)
    if (!newLocation) return

    try {
      // Call location-change API
      await changeUserLocation({
        id: newLocation.id,
        placeId: newLocation.placeId,
        isActive: true
      })

      // Refresh user details from backend
      const updatedUser = await getUserDetails()
      dispatch(setUserDetail(updatedUser))

      // Update local state
      setSelectedCity(value)

    } catch (err) {
      console.error('Error changing location:', err)
    }
  }

  return (
    <Select value={selectedCity} onValueChange={handleCityChange}>
      <SelectTrigger
        className="
          w-[130px] text-sm border border-gray-700
          bg-neutral-800
          hover:bg-neutral-700
          transition-colors
        "
      >
        <SelectValue placeholder="City" />
      </SelectTrigger>
      <SelectContent className="bg-neutral-800 text-gray-200">
        <SelectItem value={selectedCity}>{selectedCity}</SelectItem>
        {otherCities.map((city, idx) => (
          <SelectItem key={idx} value={city}>
            {city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
