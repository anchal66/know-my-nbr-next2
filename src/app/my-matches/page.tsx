'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

// Example API calls you'd implement or have in e.g. `/lib/matches.ts`
import api from '@/lib/api'

interface Media {
  id: string
  type: string
  url: string
  isVerified: boolean
  isWatermarked: boolean
  orderNo: number
}

export interface MatchItem {
  matchId: string
  userId: string
  name: string
  bio: string
  matchedAt: string
  media: Media[]
}

interface PaginatedMatches {
  content: MatchItem[]
  number: number
  size: number
  totalPages: number
  totalElements: number
  last: boolean
  first: boolean
}

export default function MyMatchesPage() {
  const router = useRouter()
  const { token, onBoardingStatus } = useSelector((state: RootState) => state.auth)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [matchesPage, setMatchesPage] = useState<PaginatedMatches | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 10

  // For controlling "Show more" expansions
  const [expandedBios, setExpandedBios] = useState<Set<string>>(new Set())

  // For Unmatch confirmation
  const [showConfirm, setShowConfirm] = useState(false)
  const [userIdToUnmatch, setUserIdToUnmatch] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }
    if (onBoardingStatus !== 'FINISHED') {
      router.push('/onboarding/profile')
      return
    }

    fetchMatches(currentPage)
  }, [token, onBoardingStatus, currentPage])

  async function fetchMatches(page: number) {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/api/v1/matches', {
        params: { page, size: pageSize },
      })
      setMatchesPage(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch matches')
    } finally {
      setLoading(false)
    }
  }

  function handleNextPage() {
    if (!matchesPage?.last) {
      setCurrentPage(matchesPage!.number + 1)
    }
  }

  function handlePrevPage() {
    if (!matchesPage?.first) {
      setCurrentPage(matchesPage!.number - 1)
    }
  }

  // Show/hide full bio
  function toggleBio(matchId: string) {
    setExpandedBios((prev) => {
      const updated = new Set(prev)
      if (updated.has(matchId)) {
        updated.delete(matchId)
      } else {
        updated.add(matchId)
      }
      return updated
    })
  }

  // Unmatch flow
  async function unmatchUser() {
    if (!userIdToUnmatch) return
    try {
      setLoading(true)
      await api.get('/api/v1/un-match', {
        params: { userId: userIdToUnmatch },
      })
      // refresh the page or remove that item from local state
      fetchMatches(currentPage)
    } catch (err) {
      console.error('Failed to unmatch user', err)
    } finally {
      setLoading(false)
      setShowConfirm(false)
      setUserIdToUnmatch(null)
    }
  }

  // Render
  return (
    <div className="p-4 space-y-6 min-h-screen bg-neutral-900 text-brand-white">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Matches</h1>

      {error && <p className="text-brand-red">{error}</p>}

      {loading && (!matchesPage || matchesPage.content.length === 0) && (
        <p className="text-gray-400">Loading matches...</p>
      )}

      {!loading && matchesPage && matchesPage.content.length === 0 && (
        <p className="text-muted-foreground">
          You have no matches yet. Keep exploring!
        </p>
      )}

      {/* Matches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matchesPage?.content.map((match) => {
          // The first image for avatar
          const firstMedia = match.media.find((m) => m.type === 'IMAGE')
          const avatarUrl = firstMedia?.url

          // Check if bio is expanded
          const isExpanded = expandedBios.has(match.matchId)
          const shortBio = match.bio.length > 100
            ? match.bio.substring(0, 100) + '...'
            : match.bio

          return (
            <div
              key={match.matchId}
              className="bg-neutral-800 border border-gray-700 rounded-lg p-4 flex flex-col"
            >
              {/* Top Section: Avatar + Name + MatchedAt */}
              <div className="flex items-center gap-4">
                {/* Avatar */}
                {avatarUrl ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={avatarUrl}
                      alt="match avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-brand-gold flex items-center justify-center text-black">
                    {/* Fallback initials or icon */}
                    <span className="font-bold">
                      {match.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-lg font-bold text-brand-gold">
                    {match.name}
                  </h2>
                  <p className="text-xs text-gray-400">
                    Matched on {new Date(match.matchedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-2 text-sm text-gray-300">
                {isExpanded ? match.bio : shortBio}
                {match.bio.length > 100 && (
                  <button
                    className="text-brand-gold ml-2 underline"
                    onClick={() => toggleBio(match.matchId)}
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="default"
                  className="bg-brand-gold text-black hover:brightness-110"
                  onClick={() => router.push(`/messages?matchId=${match.matchId}`)}
                >
                  Message
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowConfirm(true)
                    setUserIdToUnmatch(match.userId)
                  }}
                >
                  Unmatch
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination Buttons */}
      {matchesPage && (
        <div className="flex justify-between max-w-md mt-4">
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={loading || matchesPage.first}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={loading || matchesPage.last}
          >
            Next
          </Button>
        </div>
      )}

      {/* Confirm Unmatch Dialog */}
      {showConfirm && (
        <ConfirmUnmatchDialog
          onCancel={() => {
            setShowConfirm(false)
            setUserIdToUnmatch(null)
          }}
          onConfirm={unmatchUser}
          loading={loading}
        />
      )}
    </div>
  )
}

// A small confirm dialog component
function ConfirmUnmatchDialog({
  onCancel,
  onConfirm,
  loading,
}: {
  onCancel: () => void
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-md p-6 w-full max-w-sm border border-gray-700 space-y-4">
        <h3 className="text-xl text-brand-gold font-bold">
          Confirm Unmatch
        </h3>
        <p className="text-gray-200 text-sm">
          Are you sure you want to unmatch this user? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}
