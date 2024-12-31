'use client'

import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link' // Import Link from next/link
import { RootState, AppDispatch } from '@/state/store'

// For the other user's profile
import { getOtherUserProfileById, OtherUserDetailResponse } from '@/lib/otherUserProfile'
import { UserDetailResponse, MediaItem, LocationItem, getUserDetails } from '@/lib/user'

// Subscription + follow
import { getSubscriptionStatus, Subscription } from '@/lib/subscription'
import FollowModal from '../../components/FollowModal'
import UpgradeSubscriptionModal from '../../components/UpgardeSubscriptionModal'

// For icons (Lucide)
import {
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Globe,
  Phone,
  Image as ImageIcon,
  MapPin,
  CheckCircle2,
  Calendar,
  User,
  Heart,
  Globe2,
  Droplet,
  Languages,
  ArrowUpDown,
} from 'lucide-react'

// For shadcn/ui-like button styling
import { Button } from '@/components/ui/button'

// DynamicSocialIcon:
import DynamicSocialIcon from '@/components/DynamicSocialApp'

// ------------- Type Guard -------------
function isOtherUserDetailResponse(
  data: UserDetailResponse | OtherUserDetailResponse
): data is OtherUserDetailResponse {
  return (data as OtherUserDetailResponse).isFollowed !== undefined
}

export default function ProfilePage() {
  const params = useParams() as { username: string }
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const { detail: currentUserDetail } = useSelector((state: RootState) => state.user)
  const { token, username: loggedInUsername } = useSelector((state: RootState) => state.auth)

  const [currentUserLoading, setCurrentLoading] = useState(false)
  const [currentUserError, setCurrentUserError] = useState<string | null>(null)

  // local: other user
  const [otherUserDetail, setOtherUserDetail] = useState<OtherUserDetailResponse | null>(null)
  const [otherUserLoading, setOtherUserLoading] = useState(false)
  const [otherUserError, setOtherUserError] = useState<string | null>(null)

  // subscription logic
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // follow logic
  const [showFollowModal, setShowFollowModal] = useState(false)
  const [followEndDate, setFollowEndDate] = useState<string | null>(null)

  const isMyProfile = params.username === loggedInUsername

  // ----------------------------------------------------
  // useEffect: load data
  // ----------------------------------------------------
  useEffect(() => {
    if (!params.username) {
      console.error('No username param. Cannot fetch profile.')
      return
    }

    if (isMyProfile) {
      if (!currentUserDetail) {
        try {
          setCurrentLoading(true)
          getUserDetails()
        } catch (err: any) {
          setCurrentUserError(err.response?.data?.message || 'Failed to load user profile')
        } finally {
          setCurrentLoading(false)
        }
      }
      fetchSubscriptionStatus()
    } else {
      fetchOtherUser(params.username)
    }
  }, [params.username, isMyProfile, dispatch])

  // fetch subscription (my profile)
  async function fetchSubscriptionStatus() {
    try {
      const subs = await getSubscriptionStatus()
      const activeSubscription = subs.find((sub) => sub.isActive)
      setSubscription(activeSubscription || null)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  // fetch other user
  async function fetchOtherUser(u: string) {
    setOtherUserLoading(true)
    setOtherUserError(null)
    try {
      const data = await getOtherUserProfileById(u)
      setOtherUserDetail(data)
    } catch (err: any) {
      setOtherUserError(err.response?.data?.message || 'Failed to load user profile')
    } finally {
      setOtherUserLoading(false)
    }
  }

  // re-fetch after following
  async function reFetchProfile(u: string) {
    try {
      const data = await getOtherUserProfileById(u)
      setOtherUserDetail(data)
    } catch (err) {
      console.error('Failed to re-fetch:', err)
    }
  }

  // callback from FollowModal
  function handleFollowed(endDate: string) {
    setShowFollowModal(false)
    setFollowEndDate(endDate)
    setOtherUserDetail((prev) => {
      if (!prev) return prev
      return { ...prev, isFollowed: true }
    })
    if (otherUserDetail?.userProfile?.username) {
      reFetchProfile(otherUserDetail.userProfile.username)
    }
  }

  // combine data
  let userData: UserDetailResponse | OtherUserDetailResponse | null = null
  let loading = false
  let error: string | null = null

  if (isMyProfile) {
    userData = currentUserDetail
    loading = currentUserLoading
    error = currentUserError
  } else {
    userData = otherUserDetail
    loading = otherUserLoading
    error = otherUserError
  }

  const canViewPrivateData =
    isMyProfile || (userData && isOtherUserDetailResponse(userData) && userData.isFollowed)

  // ----------------------------------------------------
  // Render: loading & error
  // ----------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-brand-white flex items-center justify-center">
        <p className="text-brand-gold animate-pulse">Loading profile...</p>
      </div>
    )
  }
  if (!userData || error) {
    return (
      <div className="min-h-screen bg-black text-brand-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-red bg-brand-red/20 p-3 rounded-md border border-brand-red">
            {error || 'Failed to load profile'}
          </p>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // subscription / follow top-right
  // ----------------------------------------------------
  let subscriptionOrFollowSection = null

  if (isMyProfile) {
    subscriptionOrFollowSection = (
      <div className="flex justify-end">
        {subscription ? (
          <div className="text-sm text-green-400 flex flex-col items-end">
            <span className="mb-1">
              You are subscribed to: <strong>{subscription.type}</strong>
            </span>
            <span>
              Valid until:{' '}
              {new Date(subscription.endDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        ) : (
          <Button
            className="bg-brand-gold text-black hover:brightness-110"
            onClick={() => setShowUpgradeModal(true)}
          >
            Upgrade Profile
          </Button>
        )}
      </div>
    )
  } else if (isOtherUserDetailResponse(userData)) {
    subscriptionOrFollowSection = (
      <div className="flex justify-end">
        {userData.isFollowed ? (
          <p className="text-sm text-green-400">
            {followEndDate
              ? `Follow ends at: ${new Date(followEndDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}`
              : 'You are following this user'}
          </p>
        ) : (
          <Button
            className="bg-brand-gold text-black hover:brightness-110"
            onClick={() => setShowFollowModal(true)}
          >
            Follow
          </Button>
        )}
      </div>
    )
  }

  // derive profilePic & banner from media
  let profilePicUrl: string | null = null
  let bannerUrl: string | null = null
  if (userData.media && userData.media.length > 0) {
    profilePicUrl = userData.media[0]?.url
    if (userData.media.length > 1) {
      bannerUrl = userData.media[1]?.url
    }
  }

  return (
    <div className="min-h-screen bg-black text-brand-white p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* subscription/follow */}
      {subscriptionOrFollowSection}

      {/* Banner */}
      <Banner bannerUrl={bannerUrl} />

      {/* Basic Info (including contact numbers) */}
      <ProfileHeader userData={userData} canViewPrivateData={canViewPrivateData!} profilePicUrl={profilePicUrl} />

      {/* Stats */}
      <ProfileStats userData={userData} isMyProfile={isMyProfile} />

      {/* Personal Info */}
      <PersonalInfo userData={userData} />

      {/* Social Media (Check if user has social accounts) */}
      <MaybeSocialMedia userData={userData} canViewPrivateData={canViewPrivateData!} openFollowModal={() => setShowFollowModal(true)} />

      {/* Websites */}
      <MaybeWebsites userData={userData} canViewPrivateData={canViewPrivateData!} openFollowModal={() => setShowFollowModal(true)} />

      {/* Media */}
      <MaybeMedia userData={userData} />

      {/* Locations */}
      <MaybeLocations userData={userData} />

      {/* Follow Modal */}
      {showFollowModal && isOtherUserDetailResponse(userData) && (
        <FollowModal
          cityId={
            userData.locations && userData.locations.length > 0
              ? userData.locations[0].city.id
              : ''
          }
          onClose={() => setShowFollowModal(false)}
          onFollowed={handleFollowed}
          followedUsername={userData.userProfile.username}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeSubscriptionModal
          cityId={
            userData.locations && userData.locations.length > 0
              ? userData.locations[0].city.id
              : ''
          }
          onClose={() => setShowUpgradeModal(false)}
          onSubscribed={(sub) => setSubscription(sub)}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------
   Smaller Components
------------------------------------------------------------------ */

// Banner
function Banner({ bannerUrl }: { bannerUrl: string | null }) {
  if (!bannerUrl) {
    return <div className="w-full h-16 bg-black/20 rounded-md" />
  }
  return (
    <div className="w-full h-32 sm:h-40 md:h-48 overflow-hidden rounded-md relative mb-2">
      <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover rounded-md" />
    </div>
  )
}

// ProfileHeader
function ProfileHeader({
  userData,
  canViewPrivateData,
  profilePicUrl,
}: {
  userData: UserDetailResponse | OtherUserDetailResponse
  canViewPrivateData: boolean
  profilePicUrl: string | null
}) {
  return (
    <section className="rounded-lg border border-gray-700 bg-neutral-900 p-4 space-y-3">
      {/* top row: pic + name + @username */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
        <div className="w-24 h-24 bg-black/20 flex items-center justify-center rounded-full overflow-hidden">
          {profilePicUrl ? (
            <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={40} className="text-gray-400" />
          )}
        </div>

        {/* name & username */}
        <div className="mt-2 md:mt-0">
          <h2 className="text-xl font-semibold text-brand-gold">
            {userData.userProfile?.name || userData.userProfile?.username}
          </h2>
          <p className="text-sm text-gray-400">@{userData.userProfile?.username}</p>
        </div>
      </div>

      {/* contact numbers */}
      <ContactNumbers userData={userData} canViewPrivateData={canViewPrivateData} />

      {/* bio */}
      <div className="mt-2">
        <h3 className="text-md font-semibold text-gray-200">About</h3>
        <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">
          {userData.userProfile?.bio || 'No bio provided.'}
        </p>
      </div>
    </section>
  )
}

/* ---------------- ContactNumbers ---------------- */
function ContactNumbers({
  userData,
  canViewPrivateData,
}: {
  userData: UserDetailResponse | OtherUserDetailResponse
  canViewPrivateData: boolean
}) {
  // If MyProfile or isFollowed => we see them, otherwise check hasContactNumbers
  if (canViewPrivateData) {
    if (!userData.contactNumbers || userData.contactNumbers.length === 0) {
      return <p className="text-sm text-gray-400 mt-1">No contact numbers added.</p>
    }
    return (
      <>
        {userData.contactNumbers.map((cn) => (
          <div key={cn.id} className="flex flex-wrap items-center space-x-2 mt-1 text-sm">
            <Phone size={16} className="text-brand-gold" />
            <span>
              +{cn.countryCode}{' '}
              {cn.number}
            </span>
            {/* Apps */}
            {cn.apps?.length > 0 && (
              <div className="flex items-center space-x-3 ml-2">
                {cn.apps.map((app) => (
                  <div key={app.id}>{renderContactApp(app.name, cn.number, userData.userProfile.username)}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </>
    )
  } else {
    // not followed => check if otherUserDetailResponse => hasContactNumbers
    if (isOtherUserDetailResponse(userData)) {
      if (userData.hasContactNumbers) {
        return (
          <p className="text-sm text-gray-400 mt-1">
            This user has private phone numbers.
            <br />
            <span
              className="text-brand-gold underline cursor-pointer"
              onClick={() => alert('Open follow modal, or handle logic here')}
            >
              Follow them
            </span>{' '}
            to unlock these details!
          </p>
        )
      }
    }
    // else means user has no phone numbers at all
    return <p className="text-sm text-gray-400 mt-1">No contact numbers</p>
  }
}

// Helper for contact apps
function renderContactApp(appName: string, fullNumber: string, username: string) {
  const lower = appName.toLowerCase()

  if (lower === 'whatsapp') {
    const waLink = `https://wa.me/${fullNumber.replace('+', '')}?text=Hi I found your profile from www.knowmynbr.com/${username}`
    return (
      <>
        <DynamicSocialIcon appName="whatsapp" url={waLink} size={30} />
      </>
    )
  }

  if (lower === 'telegram') {
    const tgLink = `https://t.me/${fullNumber.replace('+', '')}?text=Hi I found your profile from www.knowmynbr.com/${username}`
    return (
      <>
        <DynamicSocialIcon appName="telegram" url={tgLink} size={30} />
      </>
    )
  }

  if (lower === 'signal') {
    const signalLink = `signal://send?number=${fullNumber.replace('+', '')}`
    return (
      <>
        <DynamicSocialIcon appName="signal" url={signalLink} size={30} />
        <span className="text-sm">Signal</span>
      </>
    )
  }

  // fallback if the app is unknown
  return (
    <span className="inline-flex items-center space-x-1 text-xs text-gray-400">
      <MessageCircle size={16} />
      <span>{appName}</span>
    </span>
  )
}

/* ---------------- ProfileStats ---------------- */
function ProfileStats({
  userData,
  isMyProfile,
}: {
  userData: UserDetailResponse | OtherUserDetailResponse
  isMyProfile: boolean
}) {
  return (
    <section className="rounded-lg border border-gray-700 bg-neutral-900 p-4 space-y-2">
      <h2 className="text-lg font-semibold">Profile Stats</h2>
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-1">
          <CheckCircle2 size={16} />
          <span>Matches: {userData.matchesCount ?? 0}</span>
        </div>
        <div className="flex items-center space-x-1">
          <CheckCircle2 size={16} />
          <span>Hearts Received: {userData.heartReceivedCount ?? 0}</span>
        </div>
        <div className="flex items-center space-x-1">
          <CheckCircle2 size={16} />
          <span>Comments: {userData.commentsCount ?? 0}</span>
        </div>

        {/* If other user => might have followersCount/followsCount */}
        {isOtherUserDetailResponse(userData) ? (
          <>
            <div className="flex items-center space-x-1">
              <CheckCircle2 size={16} />
              <span>Followers: {userData.followersCount ?? 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle2 size={16} />
              <span>Follows: {userData.followsCount ?? 0}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-1">
              <CheckCircle2 size={16} />
              <span>Followers: {userData.followers?.length ?? 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle2 size={16} />
              <span>Follows: {userData.follows?.length ?? 0}</span>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

/* ---------------- PersonalInfo ---------------- */
function PersonalInfo({
  userData,
}: {
  userData: UserDetailResponse | OtherUserDetailResponse
}) {
  return (
    <section className="rounded-lg border border-gray-700 bg-neutral-900 p-4 space-y-2">
      <h2 className="text-lg font-semibold">Personal Info</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {/* DOB */}
        <div className="flex items-center space-x-2">
          <Calendar size={16} className="text-brand-gold" />
          <span>DOB: {userData.userProfile?.dateOfBirth || 'N/A'}</span>
        </div>
        {/* Gender */}
        <div className="flex items-center space-x-2">
          <User size={16} className="text-brand-gold" />
          <span>Gender: {userData.userProfile?.gender?.name || 'N/A'}</span>
        </div>
        {/* Orientation */}
        <div className="flex items-center space-x-2">
          <Heart size={16} className="text-brand-gold" />
          <span>Orientation: {userData.userProfile?.orientation?.name || 'N/A'}</span>
        </div>
        {/* Ethnicity */}
        <div className="flex items-center space-x-2">
          <Globe2 size={16} className="text-brand-gold" />
          <span>Ethnicity: {userData.userProfile?.ethnicity?.name || 'N/A'}</span>
        </div>
        {/* Hair Color */}
        <div className="flex items-center space-x-2">
          <Droplet size={16} className="text-brand-gold" />
          <span>Hair Color: {userData.userProfile?.hairColor?.name || 'N/A'}</span>
        </div>
        {/* Height */}
        <div className="flex items-center space-x-2">
          <ArrowUpDown size={16} className="text-brand-gold" />
          <span>
            Height:{' '}
            {userData.userProfile?.heightCm
              ? `${userData.userProfile.heightCm} cm`
              : 'N/A'}
          </span>
        </div>
        {/* Languages */}
        <div className="flex items-center space-x-2 col-span-full sm:col-span-2">
          <Languages size={16} className="text-brand-gold" />
          <span>
            Languages:{' '}
            {userData.userProfile?.languages?.length
              ? userData.userProfile.languages.map((l) => l.name).join(', ')
              : 'N/A'}
          </span>
        </div>
      </div>
    </section>
  )
}

/* ---------------- MaybeSocialMedia ---------------- */
function MaybeSocialMedia({
  userData,
  canViewPrivateData,
  openFollowModal,
}: {
  userData: OtherUserDetailResponse | UserDetailResponse
  canViewPrivateData: boolean
  openFollowModal: () => void
}) {
  // If canView => show them
  if (canViewPrivateData) {
    if (!userData.socialMediaAccounts?.length) {
      return null // no social media
    }
    return <SocialMedia userData={userData} />
  }

  // not followed => check if OtherUserDetailResponse => hasSocialMediaAccounts
  if (isOtherUserDetailResponse(userData) && userData.hasSocialMediaAccounts) {
    return (
      <section className="rounded-lg border border-gray-700 bg-neutral-900 p-4 space-y-2">
        <h2 className="text-lg font-semibold">Social Media Accounts</h2>
        <p className="text-gray-400">
          This user has private social media accounts.{' '}
          <span
            className="text-brand-gold underline cursor-pointer"
            onClick={openFollowModal}
          >
            Follow them
          </span>{' '}
          to unlock these details!
        </p>
      </section>
    )
  }
  // otherwise no social media
  return null
}

/* ---------------- MaybeWebsites ---------------- */
function MaybeWebsites({
  userData,
  canViewPrivateData,
  openFollowModal,
}: {
  userData: OtherUserDetailResponse | UserDetailResponse
  canViewPrivateData: boolean
  openFollowModal: () => void
}) {
  // If canView => show them
  if (canViewPrivateData) {
    if (!userData.websites?.length) {
      return null
    }
    return <Websites userData={userData} />
  }

  // not followed => check if user has websites
  if (isOtherUserDetailResponse(userData) && userData.hasWebsites) {
    return (
      <section className="rounded-lg border border-gray-700 bg-neutral-900 p-4 space-y-2">
        <h2 className="text-lg font-semibold">Websites</h2>
        <p className="text-gray-400">
          This user has private websites.{' '}
          <span
            className="text-brand-gold underline cursor-pointer"
            onClick={openFollowModal}
          >
            Follow them
          </span>{' '}
          to unlock these details!
        </p>
      </section>
    )
  }
  // else no websites
  return null
}

/* ---------------- MaybeMedia ---------------- */
function MaybeMedia({
  userData,
}: {
  userData: OtherUserDetailResponse | UserDetailResponse
}) {
  if (!userData.media || !userData.media.length) return null
  // If there's media => show
  return <MediaGallery media={userData.media} />
}

/* ---------------- MaybeLocations ---------------- */
function MaybeLocations({
  userData,
}: {
  userData: OtherUserDetailResponse | UserDetailResponse
}) {
  if (!userData.locations || !userData.locations.length) return null
  return <Locations locations={userData.locations} />
}

/* ---------------- SocialMedia (actual) ---------------- */
function SocialMedia({ userData }: { userData: OtherUserDetailResponse | UserDetailResponse }) {
  return (
    <section className="rounded-lg border border-gray-700 bg-neutral-900 p-4 space-y-2">
      <h2 className="text-lg font-semibold">Social Media Accounts</h2>
      {userData.socialMediaAccounts?.length ? (
        <div className="flex flex-col gap-2">
          {userData.socialMediaAccounts.map((sm) => (
            <div
              key={sm.id}
              className="flex items-center space-x-2 bg-black/20 px-3 py-2 rounded"
            >
              {renderSocialMediaIcon(sm.platform.name, sm.url)}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No social media accounts added.</p>
      )}
    </section>
  )
}

function renderSocialMediaIcon(platformName: string, url: string) {
  let Icon = Globe
  const lower = platformName.toLowerCase()
  if (lower === 'facebook') Icon = Facebook
  if (lower.includes('twitter') || lower.includes('x')) Icon = Twitter
  if (lower === 'instagram') Icon = Instagram

  const link = url.startsWith('http') ? url : `https://${url}`

  // Decide internal vs external
  const isInternal = link.startsWith('/')

  if (isInternal) {
    // Use Next <Link> for internal navigation
    return (
      <Link
        href={link}
        className="inline-flex items-center space-x-1 text-brand-gold hover:text-brand-gold/80"
      >
        <Icon size={18} />
        <span className="text-sm">{platformName}</span>
      </Link>
    )
  }

  // External: open in new tab
  return (
    <Link
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center space-x-1 text-brand-gold hover:text-brand-gold/80"
    >
      <Icon size={18} />
      <span className="text-sm">{platformName}</span>
    </Link>
  )
}

/* ---------------- Websites (actual) ---------------- */
function Websites({ userData }: { userData: OtherUserDetailResponse | UserDetailResponse }) {
  return (
    <section className="rounded-lg border border-gray-700 bg-neutral-900 p-4 space-y-2">
      <h2 className="text-lg font-semibold">Websites</h2>
      {userData.websites?.length ? (
        <div className="flex flex-col gap-2">
          {userData.websites.map((site) => {
            const fullUrl = site.url.startsWith('http') ? site.url : `https://${site.url}`
            // Determine internal vs external
            const isInternal = fullUrl.startsWith(process.env.NEXT_PUBLIC_BASE_URL || '/')

            if (isInternal) {
              return (
                <Link
                  key={site.id}
                  href={fullUrl}
                  className="flex items-center justify-between bg-black/20 px-3 py-2 rounded text-sm text-brand-gold underline hover:text-brand-gold/80"
                >
                  <div className="flex items-center space-x-2">
                    <Globe size={16} className="text-brand-gold" />
                    <span className="text-sm">{truncateUrl(site.url, 30)}</span>
                  </div>
                </Link>
              )
            }

            // External link (open in new tab)
            return (
              <div
                key={site.id}
                className="flex items-center justify-between bg-black/20 px-3 py-2 rounded"
              >
                <div className="flex items-center space-x-2">
                  <Globe size={16} className="text-brand-gold" />
                  <span className="text-sm">{truncateUrl(site.url, 30)}</span>
                </div>
                <Link
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-gold underline hover:text-brand-gold/80"
                >
                  Open
                </Link>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-gray-400">No websites added.</p>
      )}
    </section>
  )
}

/* ---------------- MediaGallery (actual) ---------------- */
function MediaGallery({ media }: { media: MediaItem[] }) {
  return (
    <section className="rounded-lg border border-gray-700 bg-neutral-900 p-4 space-y-2">
      <h2 className="text-lg font-semibold">Media</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {media.map((m, idx) => (
          <div
            key={m.id || idx}
            className="bg-black/20 p-2 rounded flex items-center justify-center"
          >
            <img src={m.url} alt={m.type} className="max-h-40 object-cover rounded" />
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------------- Locations (actual) ---------------- */
function Locations({ locations }: { locations: LocationItem[] }) {
  return (
    <section className="rounded-lg border border-gray-700 bg-neutral-900 p-4 space-y-2">
      <h2 className="text-lg font-semibold">Locations</h2>
      <div className="flex flex-col gap-2">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="flex items-center space-x-2 bg-black/20 px-3 py-2 rounded"
          >
            <MapPin size={16} className="text-brand-gold" />
            <span className="text-sm">
              {loc.name}, {loc.city?.name}, {loc.city?.state}, {loc.city?.country}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

// Overlay for stats/personal if not followed
function PrivateOverlay() {
  return (
    <div className="rounded-md p-3 bg-brand-red/20 border border-brand-red text-brand-red mt-3 text-sm">
      You must follow this user to view private details.
    </div>
  )
}

// Helper to truncate URLs
function truncateUrl(url: string, maxLen = 30) {
  if (url.length <= maxLen) return url
  return url.slice(0, maxLen) + '...'
}
