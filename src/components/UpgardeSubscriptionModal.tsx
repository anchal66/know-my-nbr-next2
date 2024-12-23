import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getSubscriptionPrice, subscribeToPlan, Subscription } from '@/lib/subscription'

interface UpgradeSubscriptionModalProps {
  cityId: number
  onClose: () => void
  onSubscribed: (subscription: Subscription) => void
}

export default function UpgradeSubscriptionModal({
  cityId,
  onClose,
  onSubscribed,
}: UpgradeSubscriptionModalProps) {
  const [loading, setLoading] = useState(false)
  const [subscriptionType, setSubscriptionType] = useState('VIP') // Default type
  const [price, setPrice] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

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

    fetchPrice()
  }, [cityId, subscriptionType])

  async function handleSubscribe() {
    try {
      setLoading(true)
      const subscription = await subscribeToPlan(cityId, subscriptionType)
      onSubscribed(subscription)
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Subscription failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-md p-6 space-y-4">
        <h3 className="text-lg font-bold">Upgrade Profile</h3>

        {error && <p className="text-red-500">{error}</p>}

        <div className="space-y-2">
          <label htmlFor="subscriptionType" className="block font-medium">
            Select Subscription Type
          </label>
          <select
            id="subscriptionType"
            className="w-full border rounded p-2"
            value={subscriptionType}
            onChange={(e) => setSubscriptionType(e.target.value)}
          >
            <option value="VIP">VIP</option>
            <option value="FEATURED">FEATURED</option>
          </select>
        </div>

        {price !== null && (
          <p>
            Price for <strong>{subscriptionType}</strong>: <strong>{price}</strong> coins
          </p>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubscribe} disabled={loading || price === null}>
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  )
}
