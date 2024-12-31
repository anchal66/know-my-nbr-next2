// src/components/FollowModal.tsx
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDispatch } from 'react-redux'
import { fetchWalletBalance } from '@/state/slices/walletSlice'
import { getFollowPrice, followUser } from '@/lib/follow'
import { AppDispatch } from '@/state/store'

interface FollowModalProps {
  cityId: string
  onClose: () => void
  onFollowed: (endDate: string) => void
  followedUsername: string // Add this so we know whom to follow
}

export default function FollowModal({
  cityId,
  onClose,
  onFollowed,
  followedUsername
}: FollowModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(false)
  const [price, setPrice] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPrice() {
      try {
        setLoading(true)
        const p = await getFollowPrice(cityId)
        setPrice(p)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to get follow price')
      } finally {
        setLoading(false)
      }
    }
    fetchPrice()
  }, [cityId])

  async function handleConfirm() {
    try {
      setLoading(true)
      // Here we do POST with { followedUsername }
      const followRes = await followUser(followedUsername)
      // We have followRes.endDate
      onFollowed(followRes.endDate)
      // re-check wallet
      dispatch(fetchWalletBalance())
    } catch (err: any) {
      setError(err.response?.data?.message || 'Follow failed')
    } finally {
      setLoading(false)
    }
  }

  if (loading && price === null && !error) {
    return (
      <ModalContainer>
        <p className="p-4">Loading price...</p>
      </ModalContainer>
    )
  }

  return (
    <ModalContainer>
      <div className="bg-neutral-900 rounded p-4 space-y-4 text-white">
        {error && <p className="text-brand-red">{error}</p>}
        {price !== null && (
          <p>
            Follow user <strong>{followedUsername}</strong> for{" "}
            <strong>{price}</strong> coins?
          </p>
        )}
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading || price === null}>
            Confirm
          </Button>
        </div>
      </div>
    </ModalContainer>
  )  
}

function ModalContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-md">{children}</div>
    </div>
  )
}
