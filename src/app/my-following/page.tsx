'use client'

import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'

import { FollowResponse, getFollows } from '@/lib/follow'
import FollowModal from '@/components/FollowModal'
import { Button } from '@/components/ui/button'

export default function MyFollowsPage() {
  const cityId = useSelector((state: RootState) => state.user.detail?.activeCityId) || ''

  // Tab states: "active" vs "inactive"
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE')

  // Followers data
  const [activeFollowers, setActiveFollowers] = useState<FollowResponse[]>([])
  const [inactiveFollowers, setInactiveFollowers] = useState<FollowResponse[]>([])

  // Pagination states
  const [activePage, setActivePage] = useState(0)
  const [inactivePage, setInactivePage] = useState(0)

  // Typically you'd set size from a config or user preference
  const size = 10

  // For optional advanced pagination data
  const [activeTotalPages, setActiveTotalPages] = useState(1)
  const [inactiveTotalPages, setInactiveTotalPages] = useState(1)

  // Loading & Error handling
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Follow Modal
  const [showFollowModal, setShowFollowModal] = useState(false)
  const [usernameToFollow, setUsernameToFollow] = useState<string>('')

  // Helper to fetch either active or inactive
  async function fetchData(isActive: boolean, page: number) {
    try {
      setLoading(true)
      setError(null)
      const response = await getFollows(page, size, isActive)
      if (isActive) {
        setActiveFollowers(response.content)
        setActiveTotalPages(response.totalPages || 1)
      } else {
        setInactiveFollowers(response.content)
        setInactiveTotalPages(response.totalPages || 1)
      }
    } catch (err: any) {
      // The API interceptor can handle snackbars, but we can also do local error states if needed
      setError(err.response?.data?.message || 'Failed to load followers')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data whenever activeTab or page changes
  useEffect(() => {
    if (activeTab === 'ACTIVE') {
      fetchData(true, activePage)
    } else {
      fetchData(false, inactivePage)
    }
  }, [activeTab, activePage, inactivePage])

  // Switch tabs
  function handleTabSwitch(tab: 'ACTIVE' | 'INACTIVE') {
    setActiveTab(tab)
    setError(null)
  }

  // Pagination handlers
  function handleNextPage() {
    if (activeTab === 'ACTIVE') {
      if (activePage < activeTotalPages - 1) {
        setActivePage(activePage + 1)
      }
    } else {
      if (inactivePage < inactiveTotalPages - 1) {
        setInactivePage(inactivePage + 1)
      }
    }
  }

  function handlePrevPage() {
    if (activeTab === 'ACTIVE') {
      if (activePage > 0) {
        setActivePage(activePage - 1)
      }
    } else {
      if (inactivePage > 0) {
        setInactivePage(inactivePage - 1)
      }
    }
  }

  // FollowBack button => open the modal with a specific username
  function handleFollowBack(username: string) {
    setUsernameToFollow(username)
    setShowFollowModal(true)
  }

  // Once user has successfully followed from the modal, you can refresh activeBalance or do something
  function handleFollowed(endDate: string) {
    // Optionally refresh the list or show a success message
    if (activeTab === 'ACTIVE') {
      fetchData(true, activePage)
    } else {
      fetchData(false, inactivePage)
    }
    setShowFollowModal(false)
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Followings</h1>

      {/* Tab Buttons */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === 'ACTIVE' ? 'default' : 'secondary'}
          onClick={() => handleTabSwitch('ACTIVE')}
        >
          Active Follows
        </Button>
        <Button
          variant={activeTab === 'INACTIVE' ? 'default' : 'secondary'}
          onClick={() => handleTabSwitch('INACTIVE')}
        >
          Past Follows
        </Button>
      </div>

      {/* Info text (visible on large screens, hidden on small) */}
      <p className="hidden md:block text-muted-foreground">
        Here you can find all users whom you have followed. 
        <br />
        “Active Followers” means they are currently you are folowwing this user, 
        while “Past Followers” is the list of people you followed in past.
      </p>

      {error && (
        <p className="text-brand-red">
          {error}
        </p>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground">Loading followers...</p>
      )}

      {/* Active or Inactive Followers Table */}
      {!loading && !error && (
        <FollowerTable
          followers={activeTab === 'ACTIVE' ? activeFollowers : inactiveFollowers}
          handleFollowBack={handleFollowBack}
          isActiveTab={activeTab === 'ACTIVE'}
        />
      )}

      {/* Pagination */}
      {!loading && !error && (
        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" onClick={handlePrevPage} 
          className="bg-brand-gold text-black hover:brightness-110"
          disabled={(activeTab === 'ACTIVE' ? activePage : inactivePage) === 0}>
            Previous
          </Button>
          <Button
            variant="outline"
            className="bg-brand-gold text-black hover:brightness-110"
            onClick={handleNextPage}
            disabled={
              activeTab === 'ACTIVE'
                ? activePage >= activeTotalPages - 1
                : inactivePage >= inactiveTotalPages - 1
            }
          >
            Next
          </Button>
        </div>
      )}

      {/* Follow Modal */}
      {showFollowModal && (
        <FollowModal
          cityId={cityId}
          onClose={() => setShowFollowModal(false)}
          onFollowed={handleFollowed}
          followedUsername={usernameToFollow}
        />
      )}
    </div>
  )
}

// ----------------------------------
// A separate component for the table
// ----------------------------------
interface FollowerTableProps {
  followers: FollowResponse[]
  handleFollowBack: (username: string) => void
  isActiveTab: boolean
}

function FollowerTable({ followers, handleFollowBack, isActiveTab }: FollowerTableProps) {
  if (!followers || followers.length === 0) {
    return (
      <div className="bg-card p-4 rounded-md text-center">
        <p className="text-sm md:text-base text-muted-foreground">
          {isActiveTab
            ? 'No active followers at the moment.'
            : 'No past followers found.'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm md:text-base">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-2 text-left">Username</th>
            <th className="px-4 py-2 text-left hidden md:table-cell">Start Date</th>
            <th className="px-4 py-2 text-left hidden md:table-cell">End Date</th>
            <th className="px-4 py-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {followers.map((follower) => (
            <tr key={follower.followId} className="border-b border-muted">
              <td className="px-4 py-2">
                <a
                  href={`/${follower.followedUser.username}`}
                  className="text-primary underline"
                >
                  {follower.followedUser.username}
                </a>
              </td>
              <td className="px-4 py-2 hidden md:table-cell">
                {new Date(follower.startDate).toLocaleString()}
              </td>
              <td className="px-4 py-2 hidden md:table-cell">
                {new Date(follower.endDate).toLocaleString()}
              </td>
              <td className="px-4 py-2 text-right">
                <Button
                className="bg-brand-gold text-black hover:brightness-110"
                  variant="default"
                  size="sm"
                  onClick={() => handleFollowBack(follower.followedUser.username)}
                >
                  Follow Back
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
