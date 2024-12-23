// src/app/[username]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/state/store'
import { getUserDetails, LocationItem, MediaItem } from '@/lib/user'
import { getOtherUserProfileById } from '@/lib/otherUserProfile'
import { setUserDetail } from '@/state/slices/userSlice'
import FollowModal from '../../components/FollowModal'
import { Button } from '@/components/ui/button'
import { getSubscriptionStatus, Subscription } from '@/lib/subscription'
import UpgradeSubscriptionModal from '../../components/UpgardeSubscriptionModal'
import Image from 'next/image'
import { OptionItem } from '@/lib/nbrDirect'

type ProfileData = any 

export default function ProfilePage() {
  const { token, username: loggedInUsername } = useSelector(
    (state: RootState) => state.auth
  )
  const currentUserState = useSelector((state: RootState) => state.user.detail)

  const dispatch = useDispatch()
  const router = useRouter()
  const params = useParams() as { username: string }

  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const [showFollowModal, setShowFollowModal] = useState(false)
  const [followEndDate, setFollowEndDate] = useState<string | null>(null)

  const isMyProfile = params.username === loggedInUsername

  useEffect(() => {
    async function initPage() {
      // 1) If not logged in => redirect to /login
      if (!token) {
        router.push('/login')
        return
      }

      setLoading(true)

      // 2) If it's my profile
      if (isMyProfile) {
        // a) If we already have user in Redux => use that
        if (currentUserState) {
          setProfileData(currentUserState)

          // *** IMPORTANT FIX: fetch subscription status even if we have currentUserState
          await fetchSubscriptionStatus()
          setLoading(false)
        } else {
          // b) Otherwise fetch the user from backend
          await fetchMyProfile()
        }
      } else {
        // It's another user's profile
        if (!params.username) {
          console.error('No username param. Cannot fetch other user profile.')
          setLoading(false)
          return
        }
        await fetchOtherProfile(params.username)
      }
    }

    initPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isMyProfile, currentUserState, params.username])

  // ------------------------------------------------------------------
  // Fetch My Own Profile & Subscription
  // ------------------------------------------------------------------
  async function fetchMyProfile() {
    try {
      const data = await getUserDetails()
      dispatch(setUserDetail(data))
      setProfileData(data)

      await fetchSubscriptionStatus()
    } catch (error) {
      console.error('Error in fetchMyProfile:', error)
    } finally {
      setLoading(false)
    }
  }

  // ------------------------------------------------------------------
  // Fetch Another User's Profile
  // ------------------------------------------------------------------
  async function fetchOtherProfile(username: string) {
    try {
      const data = await getOtherUserProfileById(username)
      setProfileData(data)
    } catch (error) {
      console.error('Error in fetchOtherProfile:', error)
    } finally {
      setLoading(false)
    }
  }

  // ------------------------------------------------------------------
  // Fetch Active Subscription
  // ------------------------------------------------------------------
  async function fetchSubscriptionStatus() {
    try {
      const subscriptions = await getSubscriptionStatus()
      const activeSubscription = subscriptions.find((sub) => sub.isActive)
      setSubscription(activeSubscription || null)
    } catch (error) {
      console.error('Error fetching subscription status:', error)
    }
  }

  // ------------------------------------------------------------------
  // Rendering Logic
  // ------------------------------------------------------------------
  if (loading) {
    return <div className="p-8">Loading profile...</div>
  }
  if (!profileData) {
    return <div className="p-8">Failed to load profile.</div>
  }

  const {
    userProfile,
    contactNumbers,
    socialMediaAccounts,
    websites,
    media,
    locations,
    isFollowed,
    hasContactNumbers,
    hasSocialMediaAccounts,
    hasWebsites
  } = profileData

  const canViewContacts = isMyProfile || isFollowed
  const canViewSocial = isMyProfile || isFollowed
  const canViewWebsites = isMyProfile || isFollowed
  const cityId = locations && locations.length > 0 ? locations[0].city.id : 0

  function handleFollowed(endDate: string) {
    setShowFollowModal(false)

    // 1) Locally mark isFollowed as true
    setProfileData((prev: any) => {
      if (!prev) return prev
      return { ...prev, isFollowed: true }
    })
    setFollowEndDate(endDate)

    // 2) Re-fetch other user’s profile
    reFetchProfile(userProfile.username)
  }

  async function reFetchProfile(name: string) {
    try {
      const data = await getOtherUserProfileById(name)
      setProfileData(data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      {/* Subscription Section (only for my profile) */}
      {isMyProfile && (
        <div className="flex justify-end">
          {subscription ? (
            <p className="text-sm text-green-600">
              You are subscribed to: <strong>{subscription.type}</strong>
            </p>
          ) : (
            <Button onClick={() => setShowUpgradeModal(true)}>
              Upgrade Profile
            </Button>
          )}
        </div>
      )}

      {/* Follow Button or EndDate (only for other user profiles) */}
      {!isMyProfile && (
        <div className="flex justify-end">
          {isFollowed ? (
            <p className="text-sm text-green-600">
              {followEndDate
                ? `Follow ends at: ${followEndDate}`
                : 'You are following this user'}
            </p>
          ) : (
            <Button onClick={() => setShowFollowModal(true)}>Follow</Button>
          )}
        </div>
      )}

      <Banner bannerImage={media.find((m: MediaItem) => m.orderNo === 2)} />
      <ProfileHeader
        profileImage={media.find((m: MediaItem) => m.orderNo === 1)}
        name={userProfile.name}
        username={userProfile.username}
        bio={userProfile.bio}
      />
      <BasicDetails userProfile={userProfile} />
      <MediaGallery media={media} />

      <ContactNumbers
        canView={canViewContacts}
        hasContactNumbers={hasContactNumbers}
        contactNumbers={contactNumbers}
        name={userProfile.name}
      />
      <SocialMedia
        canView={canViewSocial}
        hasSocialMediaAccounts={hasSocialMediaAccounts}
        socialMediaAccounts={socialMediaAccounts}
        name={userProfile.name}
      />
      <Websites
        canView={canViewWebsites}
        hasWebsites={hasWebsites}
        websites={websites}
        name={userProfile.name}
      />
      <Locations locations={locations} />

      {/* Follow Modal */}
      {showFollowModal && (
        <FollowModal
          cityId={cityId}
          onClose={() => setShowFollowModal(false)}
          onFollowed={handleFollowed}
          followedUsername={userProfile.username}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeSubscriptionModal
          cityId={cityId}
          onClose={() => setShowUpgradeModal(false)}
          onSubscribed={(sub) => setSubscription(sub)}
        />
      )}
    </div>
  )
}

/* ------------------- Smaller Components ------------------- */

// 1. Banner
function Banner({ bannerImage }: { bannerImage?: MediaItem }) {
  if (!bannerImage) return null
  return (
    <div className="w-full h-48 overflow-hidden rounded-md relative">
      <Image
        src={bannerImage.url}
        alt="Banner"
        fill
        className="object-cover rounded-md"
      />
    </div>
  )
}

// 2. ProfileHeader
function ProfileHeader({
  profileImage,
  name,
  username,
  bio
}: {
  profileImage?: MediaItem
  name: string
  username: string
  bio: string
}) {
  return (
    <div className="flex space-x-4 items-center">
      {profileImage && (
        <div className="w-24 h-24 relative rounded-full overflow-hidden">
          <Image
            src={profileImage.url}
            alt="Profile"
            fill
            className="object-cover rounded-full"
          />
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold">{name}</h2>
        <p className="text-sm text-gray-600">@{username}</p>
      </div>
    </div>
  )
}

// 3. BasicDetails
function BasicDetails({ userProfile }: { userProfile: any }) {
  // you could define a more specific type for userProfile
  return (
    <>
      <div>
        <h3 className="text-xl font-semibold">Bio</h3>
        <p>{userProfile.bio}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold">Date of Birth</h4>
          <p>{userProfile.dateOfBirth}</p>
        </div>
        <div>
          <h4 className="font-semibold">Gender</h4>
          <p>{userProfile.gender.name}</p>
        </div>
        <div>
          <h4 className="font-semibold">Orientation</h4>
          <p>{userProfile.orientation.name}</p>
        </div>
        <div>
          <h4 className="font-semibold">Ethnicity</h4>
          <p>{userProfile.ethnicity.name}</p>
        </div>
        <div>
          <h4 className="font-semibold">Height (cm)</h4>
          <p>{userProfile.heightCm}</p>
        </div>
        <div>
          <h4 className="font-semibold">Hair Color</h4>
          <p>{userProfile.hairColor.name}</p>
        </div>
        <div>
          <h4 className="font-semibold">Nationality</h4>
          <p>{userProfile.nationality.name}</p>
        </div>
        <div>
          <h4 className="font-semibold">Languages</h4>
          {userProfile.languages.map((l: OptionItem) => l.name).join(', ')}
        </div>
      </div>
    </>
  )
}

// 4. MediaGallery
function MediaGallery({ media }: { media: MediaItem[] }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Media Gallery</h3>
      <div className="flex gap-4 flex-wrap">
        {media.map((m: MediaItem) => (
          <div key={m.id} className="w-32 h-32 overflow-hidden rounded-md relative">
            <Image
              src={m.url}
              alt="User media"
              fill
              className="object-cover rounded-md"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// 5. ContactNumbers
function ContactNumbers({
  canView,
  hasContactNumbers,
  contactNumbers,
  name
}: {
  canView: boolean
  hasContactNumbers: boolean
  contactNumbers: any[]
  name: string
}) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Contact Numbers</h3>
      {hasContactNumbers ? (
        canView ? (
          contactNumbers.map((cn: any) => (
            <div key={cn.id} className="border p-2 rounded mb-2">
              <p><strong>Number:</strong> +{cn.countryCode}-{cn.number}</p>
              <p><strong>Apps:</strong> {cn.apps.map((a: any) => a.name).join(', ')}</p>
              <p><strong>Private:</strong> {cn.isPrivate ? 'Yes' : 'No'}</p>
            </div>
          ))
        ) : (
          <p>{name} has added private phone numbers. Follow to unlock.</p>
        )
      ) : (
        <p>No contact numbers</p>
      )}
    </div>
  )
}

// 6. SocialMedia
function SocialMedia({
  canView,
  hasSocialMediaAccounts,
  socialMediaAccounts,
  name
}: {
  canView: boolean
  hasSocialMediaAccounts: boolean
  socialMediaAccounts: any[]
  name: string
}) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Social Media Accounts</h3>
      {hasSocialMediaAccounts ? (
        canView ? (
          socialMediaAccounts.map((sm: any) => (
            <div key={sm.id} className="border p-2 rounded mb-2">
              <p><strong>Platform:</strong> {sm.platform.name}</p>
              <p><strong>URL:</strong> {sm.url}</p>
              <p><strong>Private:</strong> {sm.isPrivate ? 'Yes' : 'No'}</p>
            </div>
          ))
        ) : (
          <p>{name} has private social media accounts. Follow to unlock.</p>
        )
      ) : (
        <p>No social media accounts</p>
      )}
    </div>
  )
}

// 7. Websites
function Websites({
  canView,
  hasWebsites,
  websites,
  name
}: {
  canView: boolean
  hasWebsites: boolean
  websites: any[]
  name: string
}) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Websites</h3>
      {hasWebsites ? (
        canView ? (
          websites.map((w: any) => (
            <div key={w.id} className="border p-2 rounded mb-2">
              <p><strong>URL:</strong> {w.url}</p>
              <p><strong>Private:</strong> {w.isPrivate ? 'Yes' : 'No'}</p>
            </div>
          ))
        ) : (
          <p>{name} has private websites. Follow to unlock.</p>
        )
      ) : (
        <p>No websites</p>
      )}
    </div>
  )
}

// 8. Locations
function Locations({ locations }: { locations: LocationItem[] }) {
  if (!locations || locations.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-2">Locations</h3>
        <p>No locations</p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Locations</h3>
      {locations.map((loc: LocationItem) => (
        <div key={loc.id} className="border p-2 rounded mb-2 flex items-center justify-between">
          <div>
            <p><strong>Name:</strong> {loc.name}</p>
            <p><strong>City:</strong> {loc.city.name}, {loc.city.state}, {loc.city.country}</p>
          </div>
          <div>{loc.isActive ? '✅' : ''}</div>
        </div>
      ))}
    </div>
  )
}