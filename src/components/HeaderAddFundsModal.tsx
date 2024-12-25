// src/components/HeaderAddFundsModal.tsx
'use client'

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addFunds, verifyPayment, fetchWalletBalance } from '@/state/slices/walletSlice'
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

      // 1) Start addFunds => get { transactionId, gatewayOrderId, status }
      const addResult = await dispatch(
        addFunds({ amount, paymentGateway: 'MojoJo', token: '' })
      ).unwrap()

      // If addFunds is successful, addResult has { transactionId, gatewayOrderId, status }
      const { transactionId, gatewayOrderId } = addResult

      // 2) Then verify payment
      // signature can be "randomToken" or a real signature from your gateway
      await dispatch(
        verifyPayment({
          gatewayOrderId,
          signature: 'randomToken',
          transactionId,
        })
      ).unwrap()

      // 3) Finally, re-fetch balance
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
      <div className="bg-neutral-900 rounded p-4 w-full max-w-sm space-y-4 text-white">
        <h2 className="text-lg font-semibold text-brand-gold">Add Funds</h2>
        {error && <div className="text-brand-red">{error}</div>}
  
        <label className="block">
          <span className="text-sm">Amount (INR)</span>
          <input
            type="number"
            className="mt-1 block w-full border border-gray-700 bg-neutral-800 rounded px-3 py-2 text-white"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1}
          />
        </label>
  
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded text-white hover:bg-gray-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-brand-gold px-4 py-2 rounded text-black hover:brightness-110"
            disabled={loading || amount <= 0}
          >
            {loading ? "Processing..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  )  
}
