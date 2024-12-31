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
import Image from 'next/image'

interface Suggestion {
  placeId: string
  description: string
}

// ----------------------------------------------------------------
//  LocationSearch Component
// ----------------------------------------------------------------
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
      <label className="text-sm text-gray-300 mb-1 block">
        Type an address to update your location (optional):
      </label>
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

// ----------------------------------------------------------------
//  LocationMap Component
// ----------------------------------------------------------------
function LocationMap({ lat, lng }: { lat: number; lng: number }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  })

  if (!isLoaded) {
    return <div>Loading map script...</div>
  }

  return (
    <div className="w-full h-64 mt-2">
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

// ----------------------------------------------------------------
//  MAIN PAGE: OnboardingLocationPage
// ----------------------------------------------------------------
export default function OnboardingLocationPage() {
  const router = useRouter()
  const dispatch = useDispatch()

  const { onBoardingStatus, token } = useSelector((state: RootState) => state.auth)

  // States
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [placeId, setPlaceId] = useState<string>('')

  const [initialLocationSaved, setInitialLocationSaved] = useState<boolean>(false)
  const [refreshTokenState, setRefreshTokenState] = useState<string>('')

  const [address, setAddress] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // ----------------------------------------------------------------
  //  On mount: if onboarding finished, or else detect user location
  // ----------------------------------------------------------------
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
            // Immediately save user location once
            const data = await saveUserLocation({
              latitude: userLat.toString(),
              longitude: userLng.toString(),
              isActive: true,
              refreshToken: ''
            })
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

  // ----------------------------------------------------------------
  //  Handle suggestion click
  // ----------------------------------------------------------------
  const handleSuggestionClick = async (suggestion: Suggestion) => {
    try {
      // Temporary save to get lat/lng & address from server
      const data = await saveUserLocation({
        placeId: suggestion.placeId,
        isActive: false,
        refreshToken: refreshTokenState
      })

      setPlaceId(suggestion.placeId)
      if (data.latitude && data.longitude) {
        setLat(parseFloat(data.latitude))
        setLng(parseFloat(data.longitude))
      }
      if (data.name) {
        setAddress(data.name + (data.city?.name ? `, ${data.city.name}` : ''))
      }

      if (data.refreshToken) {
        setRefreshTokenState(data.refreshToken)
      }

      // Clear the search box
      setSearchTerm('')
    } catch (err) {
      console.error('Error fetching location details:', err)
    }
  }

  // ----------------------------------------------------------------
  //  "Let's Begin" => final call to saveUserLocation
  // ----------------------------------------------------------------
  const handleLetsBegin = async () => {
    try {
      if (placeId) {
        // If user selected a new place
        const data = await saveUserLocation({
          placeId,
          isActive: true,
          refreshToken: refreshTokenState
        })
        if (data.refreshToken) setRefreshTokenState(data.refreshToken)
      } else {
        // Otherwise finalize lat/lng
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
        const userData = await getUserDetails()
        dispatch(setUserDetail(userData))
      }

      router.push('/')
    } catch (error) {
      console.error(error)
      alert('Failed to finalize location. Please try again.')
    }
  }

  // ----------------------------------------------------------------
  //  If lat/lng not ready, show loading
  // ----------------------------------------------------------------
  if (lat === null || lng === null) {
    return (
      <div className="min-h-screen bg-neutral-900 text-brand-white p-4 flex items-center justify-center">
        <p className="text-gray-300">Fetching your current location...</p>
      </div>
    )
  }

  // ----------------------------------------------------------------
  //  Final Render: Two-column layout, more hints
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-neutral-900 text-brand-white">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto">
        {/* LEFT COLUMN: Intro, instructions */}
        <div className="flex flex-col justify-center p-6 md:p-12 border-b border-neutral-800 md:border-b-0 md:border-r border-neutral-700">
          <div className="flex flex-col items-center md:items-start mb-6">
            <Image
              src="/logo2.png"
              alt="Know My Nbr Logo"
              width={150}
              height={150}
              priority
              className="mb-4"
            />
            <h1 className="text-3xl font-bold text-brand-gold text-center md:text-left">
              Onboarding - Location
            </h1>
            <p className="text-sm md:text-base text-gray-400 mb-4 text-center md:text-left">
              Verify Your Location
            </p>
          </div>

          <p className="hidden md:block text-sm md:text-base leading-6 text-gray-300 mb-4">
            We've automatically detected your current location. If you're happy with it, 
            just click “Let’s Begin.” Want a different address? Type it on the right!
          </p>

          <p className="text-sm text-gray-400">
            We use your location to show nearby matches. You can update it anytime.
          </p>
        </div>

        {/* RIGHT COLUMN: Search, current address, map, button */}
        <div className="p-6 md:p-12 flex flex-col gap-4 bg-neutral-800 border border-gray-700">
          {/* LocationSearch Box */}
          <LocationSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSuggestionSelect={handleSuggestionClick}
          />

          {/* Current Address (below search box) */}
          <div className="text-sm text-gray-300">
            <span className="font-semibold text-brand-gold">Current Address:</span>{' '}
            {address || 'No custom address chosen'}
          </div>

          {/* Map */}
          <LocationMap lat={lat} lng={lng} />

          <div className="flex flex-col items-center mt-4">
            <Button
              className="bg-brand-gold text-black hover:brightness-110 w-full"
              onClick={handleLetsBegin}
            >
              Let’s Begin
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
