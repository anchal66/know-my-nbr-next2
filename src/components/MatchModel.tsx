'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface MatchModalProps {
  matchId: string | null
  onClose: () => void
}

export default function MatchModal({ matchId, onClose }: MatchModalProps) {
  const router = useRouter()

  function handleGoToMessages() {
    // Possibly pass matchId as a query param or just navigate to /messages
    router.push('/messages')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-neutral-900 w-full max-w-sm rounded shadow-lg p-6 flex flex-col space-y-4 text-white">
        <h2 className="text-2xl font-bold text-center text-brand-gold">
          Congratulations!
        </h2>
        <p className="text-center">It’s a match!</p>
        <div className="flex justify-center space-x-4 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleGoToMessages}>
            Go to Messages
          </Button>
        </div>
      </div>
    </div>
  )  
}
