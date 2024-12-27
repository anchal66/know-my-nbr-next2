// src/app/onboarding/location/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import { useRouter } from 'next/navigation'
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'

// --- API and helper imports
import { saveUserLocation, getLocationSuggestions } from '@/lib/onboarding'
import { getUserDetails } from '@/lib/user'
import { setUserDetail } from '@/state/slices/userSlice'
import { setToken } from '@/lib/cookies'
import { decodeToken } from '@/lib/jwt'
import { setCredentials } from '@/state/slices/authSlice'

// --- UI imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Suggestion {
  placeId: string
  description: string
}

// -----------------------------------------------------------
//  LocationSearch COMPONENT
// -----------------------------------------------------------
function LocationSearch({
  searchTerm,
  setSearchTerm,
  onSuggestionSelect
}: {
  searchTerm: string
  setSearchTerm: (val: string) => void
  onSuggestionSelect: (suggestion: Suggestion) => void
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

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

  return (
    <div className="relative">
      <Input
        placeholder="Search for a location..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true)
        }}
        className="bg-neutral-800 border border-gray-700 text-gray-200"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 top-full left-0 w-full bg-neutral-800 border border-gray-700 shadow-md max-h-60 overflow-auto">
          {suggestions.map((s) => (
            <div
              key={s.placeId}
              className="p-2 hover:bg-neutral-700 cursor-pointer"
              onClick={() => {
                onSuggestionSelect(s) // parent will handle the selection
                setShowSuggestions(false)
              }}
            >
              {s.description}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------
//  LocationMap COMPONENT
// -----------------------------------------------------------
function LocationMap({ lat, lng }: { lat: number; lng: number }) {
  // Load the Google Maps script
  const { isLoaded } = useLoadScript({
    // IMPORTANT: Must be `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` if you're referencing .env.local
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  if (!isLoaded) {
    return <div>Loading map script...</div>
  }

  return (
    <div className="w-full h-64">
      <GoogleMap
        center={{ lat, lng }}
        zoom={14}
        mapContainerStyle={{ width: '100%', height: '100%' }}
      >
        <Marker position={{ lat, lng }} />
      </GoogleMap>
    </div>
  )
}

// -----------------------------------------------------------
//  MAIN PAGE COMPONENT
// -----------------------------------------------------------
export default function OnboardingLocationPage() {
  const router = useRouter()
  const dispatch = useDispatch()

  const { onBoardingStatus, token } = useSelector((state: RootState) => state.auth)

  // 1) States for lat/lng/placeId
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [placeId, setPlaceId] = useState<string>('')

  // 2) This keeps track if we already saved the **initial** location once.
  const [initialLocationSaved, setInitialLocationSaved] = useState<boolean>(false)

  // 3) Refresh token from the server (if your backend returns it).
  const [refreshTokenState, setRefreshTokenState] = useState<string>('')

  // 4) For display only
  const [address, setAddress] = useState<string>('')

  // 5) For location search
  const [searchTerm, setSearchTerm] = useState<string>('')

  // -----------------------------------------------------------
  //  On mount: check if onboarding finished, then fetch location.
  // -----------------------------------------------------------
  useEffect(() => {
    if (onBoardingStatus === 'FINISHED') {
      router.push('/')
      return
    }

    if (!initialLocationSaved) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude
          const userLng = position.coords.longitude
          setLat(userLat)
          setLng(userLng)

          try {
            // Immediately call saveUserLocation with lat/lng (once).
            const data = await saveUserLocation({
              latitude: userLat.toString(),
              longitude: userLng.toString(),
              isActive: true,
              refreshToken: '' // or pass in your stored refresh token if needed
            })

            // If the backend returns an address or city info
            if (data.name) {
              setAddress(data.name + (data.city?.name ? `, ${data.city.name}` : ''))
            }

            if (data.refreshToken) {
              setRefreshTokenState(data.refreshToken)
            }

            setInitialLocationSaved(true)
          } catch (error) {
            console.error('Error saving initial location:', error)
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
        }
      )
    }
  }, [onBoardingStatus, router, initialLocationSaved])

  // -----------------------------------------------------------
  //  Handling suggestion click
  // -----------------------------------------------------------
  const handleSuggestionClick = async (suggestion: Suggestion) => {
    try {
      // Instead of just storing placeId, we want to get lat/lng so the map updates.
      // We'll do a *temporary* save with isActive=false to get lat/lng & address from the server.
      const data = await saveUserLocation({
        placeId: suggestion.placeId,
        isActive: false,  // Not finalizing
        refreshToken: refreshTokenState
      })

      // Update local states so user can see the new location on the map & address
      setPlaceId(suggestion.placeId)
      if (data.latitude && data.longitude) {
        setLat(parseFloat(data.latitude))
        setLng(parseFloat(data.longitude))
      }
      if (data.name) {
        setAddress(data.name + (data.city?.name ? `, ${data.city.name}` : ''))
      }

      // If backend returns a new refresh token, store it
      if (data.refreshToken) {
        setRefreshTokenState(data.refreshToken)
      }

      // Clear search box
      setSearchTerm('')
    } catch (err) {
      console.error('Error fetching location details for suggestion:', err)
    }
  }

  // -----------------------------------------------------------
  //  "Let's Begin" -> final call to saveUserLocation 
  // -----------------------------------------------------------
  const handleLetsBegin = async () => {
    try {
      // If user selected a place from suggestions, we'll finalize that place
      if (placeId) {
        const data = await saveUserLocation({
          placeId,
          isActive: true,
          refreshToken: refreshTokenState
        })
        if (data.refreshToken) setRefreshTokenState(data.refreshToken)
      } else {
        // Otherwise, user never picked a new place => finalize lat/lng
        if (lat === null || lng === null) {
          alert('No valid lat/lng found.')
          return
        }
        const data = await saveUserLocation({
          latitude: lat.toString(),
          longitude: lng.toString(),
          isActive: true,
          refreshToken: refreshTokenState
        })
        if (data.refreshToken) setRefreshTokenState(data.refreshToken)
      }

      // If the final call returned or we stored a token, set it in cookies & redux
      if (!refreshTokenState) {
        alert('No token returned. Could not finalize.')
        return
      }

      setToken(refreshTokenState)
      const decoded = decodeToken(refreshTokenState)
      if (decoded) {
        dispatch(
          setCredentials({
            token: refreshTokenState,
            username: decoded.username,
            role: decoded.role,
            onBoardingStatus: decoded.onBoardingStatus,
          })
        )
        // Fetch user details
        const userData = await getUserDetails()
        dispatch(setUserDetail(userData))
      }

      // Finally navigate to Home
      router.push('/')
    } catch (error) {
      console.error(error)
      alert('Failed to finalize location. Please try again.')
    }
  }

  // -----------------------------------------------------------
  //  RENDER
  // -----------------------------------------------------------
  if (lat === null || lng === null) {
    return (
      <div className="min-h-screen bg-neutral-900 text-brand-white p-4">
        <p>Fetching your current location...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-brand-white p-4">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl text-brand-gold mb-4">Onboarding - Location</h1>

        <p className="text-gray-300">
          We have detected your location. If you want to change it, use the
          search box below.
        </p>

        {/* LOCATION SEARCH */}
        <LocationSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSuggestionSelect={handleSuggestionClick}
        />

        <p className="text-gray-300">
          <strong className="text-brand-gold">Current Address:</strong>{' '}
          {address || 'No custom address chosen'}
        </p>

        {/* MAP */}
        <LocationMap lat={lat} lng={lng} />

        {/* BUTTON */}
        <Button
          className="bg-brand-gold text-black hover:brightness-110"
          onClick={handleLetsBegin}
        >
          Let’s Begin
        </Button>
      </div>
    </div>
  )
}
