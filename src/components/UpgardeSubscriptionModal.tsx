import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  getSubscriptionPrice,
  subscribeToPlan,
  Subscription,
} from '@/lib/subscription'
import { fetchWalletBalance } from '@/state/slices/walletSlice'
import { AppDispatch, RootState } from '@/state/store'
import { useDispatch, useSelector } from 'react-redux'
import { getCityUserCount } from '@/lib/user' // <-- import new helper
import { FaCrown } from 'react-icons/fa'

interface UpgradeSubscriptionModalProps {
  cityId: string
  onClose: () => void
  onSubscribed: (subscription: Subscription) => void
}

export default function UpgradeSubscriptionModal({
  cityId,
  onClose,
  onSubscribed,
}: UpgradeSubscriptionModalProps) {
  const dispatch = useDispatch<AppDispatch>()

  // Fetching location in Redux
  const locationId = useSelector((state: RootState) => state.user.detail?.activeCityId)

  // State
  const [loading, setLoading] = useState(false)
  const [subscriptionType, setSubscriptionType] = useState<'VIP' | 'FEATURED'>('VIP')
  const [price, setPrice] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cityCount, setCityCount] = useState<number | null>(null)

  // Fetch subscription price when cityId or subscriptionType changes
  useEffect(() => {
    async function fetchPrice() {
      try {
        setLoading(true)
        const fetchedPrice = await getSubscriptionPrice(cityId, subscriptionType)
        setPrice(fetchedPrice)
      } catch (err) {
        setError('Failed to fetch price')
      } finally {
        setLoading(false)
      }
    }

    if (cityId) {
      fetchPrice()
    }
  }, [cityId, subscriptionType])

  // Fetch city user count
  useEffect(() => {
    async function fetchCityCount() {
      try {
        setLoading(true)
        const userCount = await getCityUserCount(locationId!)
        setCityCount(userCount)
      } catch (err) {
        // Log error; don't necessarily show a user-facing error for city count
        console.error('Failed to fetch city user count', err)
      } finally {
        setLoading(false)
      }
    }

    if (locationId) {
      fetchCityCount()
    }
  }, [locationId])

  // Handle subscription
  async function handleSubscribe() {
    try {
      setLoading(true)
      const subscription = await subscribeToPlan(cityId, subscriptionType)
      onSubscribed(subscription)
      await dispatch(fetchWalletBalance())
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Subscription failed')
    } finally {
      setLoading(false)
    }
  }

  // A small helper to render the correct “crown banner” and “benefits” for each subscription type
  function renderBenefits() {
    if (subscriptionType === 'VIP') {
      return (
        <>
          <div className="flex flex-col items-center">
            {/* Big gold crown banner */}
            <div className="text-yellow-400 text-8xl mb-3">
              <FaCrown />
            </div>
            <p className="text-center text-sm md:text-base">
              There are more than <strong>{cityCount ?? '...'}</strong> profiles in your city.
              VIP profiles are ranked <strong>highest</strong> in NBR Direct.
            </p>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-sm md:text-base">
            <li>
              Recommended on top in NBR-Direct
            </li>
            <li>
              <strong className="text-yellow-400">Gold Crown</strong> on your profile
              for higher visibility in NBR Direct
            </li>
            <li>Unlimited likes in the Swipe screen</li>
            <li>Profile recommendations boosted in the Swipe screen</li>
          </ul>
        </>
      )
    } else {
      return (
        <>
          <div className="flex flex-col items-center">
            {/* Big silver crown banner */}
            <div className="text-gray-300 text-8xl mb-3">
              <FaCrown />
            </div>
            <p className="text-center text-sm md:text-base">
              There are more than <strong>{cityCount ?? '...'}</strong> profiles in your city.
              Featured profiles are ranked <strong>higher</strong> (after VIP) in NBR Direct.
            </p>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-sm md:text-base">
            <li>
              Recommended on top after VIP in NBR-Direct
            </li>
            <li>
              <strong className="text-gray-300">Silver Crown</strong> on your profile
              for higher visibility in NBR Direct
            </li>
            <li>Unlimited likes in the Swipe screen</li>
            <li>Profile recommendations boosted in the Swipe screen</li>
          </ul>
        </>
      )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      {/* Container for the modal */}
      <div className="bg-neutral-900 rounded-lg shadow-md p-4 sm:p-6 w-full max-w-md space-y-4 text-white">

        {/* Header */}
        <h3 className="text-xl font-bold text-center text-brand-gold">
          Upgrade Profile
        </h3>

        {/* Error message */}
        {error && (
          <p className="text-brand-red text-center">
            {error}
          </p>
        )}

        {/* Subscription Type Selector */}
        <div className="space-y-2">
          <label htmlFor="subscriptionType" className="block font-medium">
            Select Subscription Type
          </label>
          <select
            id="subscriptionType"
            className="w-full border border-gray-700 rounded p-2 bg-neutral-800 text-white"
            value={subscriptionType}
            onChange={(e) =>
              setSubscriptionType(e.target.value as 'VIP' | 'FEATURED')
            }
            disabled={loading}
          >
            <option value="VIP">VIP</option>
            <option value="FEATURED">FEATURED</option>
          </select>
        </div>

        {/* Benefits Section */}
        <div className="bg-neutral-800 p-3 rounded space-y-3">
          {renderBenefits()}
        </div>

        {/* Price Info */}
        {price !== null && (
          <p className="text-center text-sm md:text-base">
            <span className="block">Price for <strong>{subscriptionType}</strong>:</span>
            <strong className="text-lg">{price} points from wallet</strong>
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubscribe}
            disabled={loading || price === null}
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </div>
      </div>
    </div>
  )
}
