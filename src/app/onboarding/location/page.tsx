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
  const { token } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  const dispatch = useDispatch()

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  })

  /** 
   * We keep track of lat/lng/placeId in state.
   * The user can override them by picking a suggestion. 
   */
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [placeId, setPlaceId] = useState<string>('')

  /** Refresh token from the server (if your backend gives a new token each time). */
  const [refreshToken, setRefreshToken] = useState<string>('')

  /** Address for display. */
  const [address, setAddress] = useState<string>('')

  /** For location search. */
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    // If not logged in => redirect (optional, depends on your flow)
    // if (!token) {
    //   router.push('/login')
    //   return
    // }

    // Grab geolocation but do NOT call saveUserLocation automatically
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude)
        setLng(position.coords.longitude)
        // We'll only finalize location on "Let's Begin"
      },
      (error) => {
        console.error('Geolocation error:', error)
      }
    )
  }, [token, router])

  /** Whenever user types in search box, fetch suggestions. */
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

  /**
   * When the user clicks a suggestion:
   * 1) Call saveUserLocation with that placeId => server returns lat/lng, address, refreshToken
   * 2) Update local states so the map & address show the new location
   */
  const handleSuggestionClick = async (suggestion: Suggestion) => {
    try {
      const data = await saveUserLocation({
        placeId: suggestion.placeId,
        isActive: true,
        refreshToken, // if needed
      })
      // Update local states
      setPlaceId(data.placeId || '')
      setLat(data.latitude)
      setLng(data.longitude)
      setAddress(
        data.name + (data.city?.name ? `, ${data.city.name}` : '')
      )
      if (data.refreshToken) setRefreshToken(data.refreshToken)

      setSearchTerm('')
      setShowSuggestions(false)
      // Now user location is "partially saved," but we'll finalize on "Let's Begin"
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Final step: user clicks "Let's Begin".
   * We call saveUserLocation AGAIN with whichever final placeId or lat/lng is in state,
   * then set the token, fetch user detail, and redirect to home.
   */
  const handleLetsBegin = async () => {
    try {
      const finalData = await saveUserLocation({
        placeId,
        latitude: lat ? lat.toString() : '',
        longitude: lng ? lng.toString() : '',
        isActive: true,
        refreshToken, 
      })
      // finalData might contain a final refreshToken from the server
      const finalToken = finalData.refreshToken
      if (!finalToken) {
        alert('No token returned. Could not finalize.')
        return
      }
      // Put that token in cookies
      setToken(finalToken)

      // Decode & set credentials in Redux
      const decoded = decodeToken(finalToken)
      if (decoded) {
        dispatch(
          setCredentials({
            token: finalToken,
            username: decoded.username,
            role: decoded.role,
            onBoardingStatus: decoded.onBoardingStatus,
          })
        )
        // Also fetch user details
        const userData = await getUserDetails()
        dispatch(setUserDetail(userData))

        // On success, user onboarding FINISHED => go to home
        router.push('/')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to finalize location. Please try again.')
    }
  }

  if (!isLoaded) {
    return <div>Loading map script...</div>
  }
  if (lat === null || lng === null) {
    return <div>Fetching your current location...</div>
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl mb-4">Onboarding - Location</h1>
      <p>
        We have detected your location. If you want to change it, use the
        search box below.
      </p>

      {/* SEARCH INPUT */}
      <div className="relative">
        <Input
          placeholder="Search for a location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true)
          }}
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

      <p>
        <strong>Current Address:</strong>{' '}
        {address || 'No custom address chosen'}
      </p>

      {/* MAP */}
      <div className="w-full h-64">
        <GoogleMap
          center={{ lat, lng }}
          zoom={14}
          mapContainerStyle={{ width: '100%', height: '100%' }}
        >
          <Marker position={{ lat, lng }} />
        </GoogleMap>
      </div>

      <Button onClick={handleLetsBegin}>Let's Begin</Button>
    </div>
  )
}
