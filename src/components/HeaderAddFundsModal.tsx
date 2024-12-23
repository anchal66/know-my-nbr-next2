'use client'

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addFunds, fetchWalletBalance } from '@/state/slices/walletSlice'
import { AppDispatch } from '@/state/store'

interface HeaderAddFundsModalProps {
  onClose: () => void
}

export function HeaderAddFundsModal({ onClose }: HeaderAddFundsModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [amount, setAmount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)
      // For example, we choose "DUMMY" or "INSTAMOJO" depending on what you want:
      await dispatch(addFunds({ amount, paymentGateway: 'INSTAMOJO', token: '' })).unwrap()
      // Re-fetch wallet balance
      await dispatch(fetchWalletBalance())
      onClose()
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded p-4 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-semibold">Add Funds</h2>
        {error && <div className="text-red-500">{error}</div>}

        <label className="block">
          <span className="text-sm text-gray-700">Amount (INR)</span>
          <input
            type="number"
            className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1}
          />
        </label>

        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-200 px-4 py-2 rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading || amount <= 0}
          >
            {loading ? 'Processing...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
