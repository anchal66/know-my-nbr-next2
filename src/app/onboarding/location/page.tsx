'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import { useRouter } from 'next/navigation'
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'
import { saveUserLocation, getLocationSuggestions } from '@/lib/onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserDetails } from '@/lib/user'
import { setUserDetail } from '@/state/slices/userSlice'
import { setToken } from '@/lib/cookies'
import { decodeToken } from '@/lib/jwt'
import { setCredentials } from '@/state/slices/authSlice'

interface Suggestion {
  placeId: string
  description: string
}

export default function OnboardingLocationPage() {
  const { onBoardingStatus, token } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  const dispatch = useDispatch()

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  })

  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [placeId, setPlaceId] = useState<string>('')
  const [refreshToken, setRefreshToken] = useState<string>('')
  const [address, setAddress] = useState<string>('') // current displayed address

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    // if (!token) {
    //   router.push('/login')
    //   return
    // }
    // if (onBoardingStatus === 'FINISHED') {
    //   router.push('/')
    //   return
    // }
    // // If user did not finish previous steps, redirect accordingly
    // if (onBoardingStatus === 'EMPTY') {
    //   router.push('/onboarding/profile')
    //   return
    // }
    // if (onBoardingStatus === 'PROFILE') {
    //   router.push('/onboarding/private-data')
    //   return
    // }
    // if (onBoardingStatus === 'PRIVATE_CONTACT') {
    //   // We are now at step 3 done, should be at step 4 next.
    //   // If not done step 3 properly, redirect:
    //   router.push('/onboarding/media')
    //   return
    // }
    // Now presumably user is at step 4 or after media step (MEDIA_UPLOADED).

    // Get current location
    navigator.geolocation.getCurrentPosition(async (position) => {
      const currentLat = position.coords.latitude
      const currentLng = position.coords.longitude
      setLat(currentLat)
      setLng(currentLng)

      // First call: save current location
      try {
        const data = await saveUserLocation({
          latitude: currentLat.toString(),
          longitude: currentLng.toString(),
          name: '',
          city: '',
          isActive: true
        })
        // Response includes placeId, name, city, and refreshToken
        if (data.placeId) setPlaceId(data.placeId)
        if (data.name) setAddress(data.name + (data.city?.name ? `, ${data.city.name}` : ''))
        if (data.refreshToken) setRefreshToken(data.refreshToken)
      } catch (error) {
        console.error(error)
        // If save fails, handle error or show user a message
      }
    })
  }, [token, onBoardingStatus, router])

  // Handle search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length > 2) {
        const data = await getLocationSuggestions(searchTerm)
        setSuggestions(data)
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
      }
    }
    fetchSuggestions()
  }, [searchTerm])

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    // Call Step 4 API again with placeId and refreshToken to update location
    try {
      const data = await saveUserLocation({
        placeId: suggestion.placeId,
        isActive: true,
        refreshToken: refreshToken // Use the previously obtained refreshToken
      })
      setPlaceId(data.placeId)
      setLat(data.latitude)
      setLng(data.longitude)
      setAddress(data.name + (data.city?.name ? `, ${data.city.name}` : ''))
      setShowSuggestions(false)
      setSearchTerm('')
      if (data.refreshToken) setRefreshToken(data.refreshToken) // update refreshToken if changed
    } catch (err) {
      console.error(err)
    }
  }

  const handleLetsBegin = async () => {
    // Finalize location. If user didn't pick a new location, we already have placeId or lat/lng.
    // Call saveUserLocation again with the current placeId or lat/lng and refreshToken
    try {
      const data = await saveUserLocation({
        placeId: placeId || '',
        latitude: lat ? lat.toString() : '',
        longitude: lng ? lng.toString() : '',
        isActive: true,
      })
      const token = data.refreshToken;
      // On success, user onboarding should be FINISHED, redirect to home
      // Immediately fetch user detail
      setToken(token)
      const decoded = decodeToken(token)
      if (decoded) {
        dispatch(setCredentials({
          token,
          username: decoded.username,
          role: decoded.role,
          onBoardingStatus: decoded.onBoardingStatus
        }));
        const userData = await getUserDetails()
        dispatch(setUserDetail(userData))
        router.push('/')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to finalize location. Please try again.')
    }
  }

  if (!isLoaded || lat === null || lng === null) {
    return <div>Loading map...</div>
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl mb-4">Onboarding - Location</h1>
      <p>We have detected your current location. If you want to change it, use the search box below.</p>

      <div className="relative">
        <Input
          placeholder="Search for a location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 top-full left-0 w-full bg-white border shadow-md max-h-60 overflow-auto">
            {suggestions.map((s) => (
              <div
                key={s.placeId}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => handleSuggestionClick(s)}
              >
                {s.description}
              </div>
            ))}
          </div>
        )}
      </div>

      <p><strong>Current Address:</strong> {address || 'Not available'}</p>

      <div className="w-full h-64">
        <GoogleMap
          center={{ lat: lat, lng: lng }}
          zoom={14}
          mapContainerStyle={{ width: '100%', height: '100%' }}
        >
          <Marker position={{ lat: lat, lng: lng }} />
        </GoogleMap>
      </div>

      <Button onClick={handleLetsBegin}>Let's Begin</Button>
    </div>
  )
}
