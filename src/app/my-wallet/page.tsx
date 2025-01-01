'use client'

import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/state/store'
import { Button } from '@/components/ui/button'
import {
  fetchWalletBalance,
  fetchWalletTransactions,
  sendFunds,
} from '@/state/slices/walletSlice'
import HeaderAddFundsModal from '@/components/HeaderAddFundsModal'
import PaymentServiceUnavailableModal from '@/components/PaymentServiceUnavailableModal'
import { Mail } from 'lucide-react'


export default function MyWalletPage() {
  const dispatch = useDispatch<AppDispatch>()

  // Grab necessary parts of wallet state
  const { balance, transactions, loading, error } = useSelector((state: RootState) => state.wallet)
  const { token, username } = useSelector((state: RootState) => state.auth)

  // Local states for forms
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false)
  const [isServiceUnavailableModalOpen, setIsServiceUnavailableModalOpen] = useState(false)
  const [sendToUsername, setSendToUsername] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [sendMessage, setSendMessage] = useState('')

  // We'll fetch page=0, size=10 for transactions
  // You could store pagination in local state as well if needed
  const page = 0
  const size = 10

  // On mount or whenever user logs in/out, fetch balance & transactions
  useEffect(() => {
    if (token && username) {
      dispatch(fetchWalletBalance())
      dispatch(fetchWalletTransactions({ page, size }))
    }
  }, [dispatch, token, username])

  // Handler for opening the "Add Funds" modal
  const handleOpenAddFundsModal = () => {
    setIsAddFundsModalOpen(true)
  }

  // Handler for closing the "Add Funds" modal
  const handleCloseAddFundsModal = () => {
    setIsAddFundsModalOpen(false)
  }

   // Handler if payment is unavailable
   const handleServiceUnavailable = () => {
    setIsServiceUnavailableModalOpen(true)
  }

  // Handler for closing the "Service Unavailable" modal
  const handleCloseServiceUnavailableModal = () => {
    setIsServiceUnavailableModalOpen(false)
  }

  // Handler: send funds
  const handleSendFunds = async () => {
    if (!sendToUsername || !sendAmount) return
    const amountParsed = parseFloat(sendAmount)
    if (Number.isNaN(amountParsed) || amountParsed <= 0) {
      alert('Please enter a valid amount > 0')
      return
    }
    try {
      await dispatch(sendFunds({ username: sendToUsername, amount: amountParsed, message: sendMessage })).unwrap()
      // After sending funds, we can refresh the balance & transactions
      dispatch(fetchWalletBalance())
      dispatch(fetchWalletTransactions({ page, size }))
      // Clear form
      setSendToUsername('')
      setSendAmount('')
      setSendMessage('')
    } catch (err: any) {
      console.error('Send funds failed:', err)
    }
  }

  return (
    <div className="min-h-screen w-full bg-black text-brand-white">
      {/* Container */}
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
        {/* Page Title */}
        <h1 className="text-2xl font-bold pb-2 border-b border-gray-700">My Wallet</h1>

        {/* Loading / Error */}
        {loading && <div className="text--brand-gold animate-pulse">Loading...</div>}
        {error && (
          <div className="text-red-400 bg-red-900/30 p-2 rounded-md">
            Error: {error} reach support@knowmynbr.com
          </div>
        )}

        {/* Balance Card */}
        <div className="rounded-lg border border-gray-700 bg-neutral-900 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold">Wallet Balance</h2>
            <p className="text-2xl font-bold mt-2">{`\u20B9`} {balance.toFixed(2)}</p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-brand-gold text-black hover:brightness-110 transition-colors"
              onClick={() => dispatch(fetchWalletBalance())}
            >
              Refresh
            </Button>

            {/* Add Money Button => Opens modal */}
            <Button
              className="bg-brand-gold text-black hover:brightness-110 transition-colors"
              onClick={handleOpenAddFundsModal}
            >
              Add Money
            </Button>
          </div>
        </div>

        {/* Send Funds */}
        <div className="rounded-lg border border-gray-700 bg-neutral-900 p-4 space-y-4">
          <h2 className="text-lg font-semibold">Send Funds to a Friend</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Friend's Username</label>
              <input
                type="text"
                value={sendToUsername}
                onChange={(e) => setSendToUsername(e.target.value)}
                className="block w-full rounded-md border border-gray-700 bg-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Amount</label>
              <input
                type="number"
                min="1"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="block w-full rounded-md border border-gray-700 bg-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                placeholder="Enter amount"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Message (optional)</label>
              <input
                type="text"
                value={sendMessage}
                onChange={(e) => setSendMessage(e.target.value)}
                className="block w-full rounded-md border border-gray-700 bg-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                placeholder="E.g. Thanks for dinner!"
              />
            </div>
          </div>
          <Button
            onClick={handleSendFunds}
            className="bg-brand-gold text-black hover:brightness-110 transition-colors"
          >
            Send Now
          </Button>
        </div>

        {/* Transaction History */}
        <div className="rounded-lg border border-gray-700 bg-neutral-900 p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          {!transactions || transactions?.content?.length === 0 ? (
            <p className="text-gray-400">No transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-2 text-left font-medium">Date</th>
                    <th className="px-4 py-2 text-left font-medium">Description</th>
                    <th className="px-4 py-2 text-left font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions?.content?.map((txn, idx) => (
                    <tr
                      key={idx}
                      className="border-b last:border-0 border-gray-700 hover:bg-neutral-800 transition-colors"
                    >
                      <td className="px-4 py-2 whitespace-nowrap">
                        {txn.createdAt ?? 'N/A'}
                      </td>
                      <td className="px-4 py-2 whitespace-pre">
                        {txn.description ?? 'N/A'}
                      </td>
                      <td className="px-4 py-2">
                        {`\u20B9`} {txn.amount?.toFixed(2) ?? '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Basic pagination info (optional) */}
          {transactions && (
            <div className="mt-2 text-sm text-gray-400">
              Page {transactions.number + 1} of {transactions.totalPages}
              {' ('}
              {transactions.totalElements} total
              {')'}
            </div>
          )}
        </div>
      </div>
      {/* Add Funds Modal */}
      {isAddFundsModalOpen && (
        <HeaderAddFundsModal
          onClose={handleCloseAddFundsModal}
          onServiceUnavailable={handleServiceUnavailable}
        />
      )}

      {/* Service Unavailable Modal */}
      {isServiceUnavailableModalOpen && (
        <PaymentServiceUnavailableModal onClose={handleCloseServiceUnavailableModal} />
      )}
    </div>
  )
}
