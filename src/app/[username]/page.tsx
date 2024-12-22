// src/app/[username]/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/state/store'
import { getUserDetails } from '@/lib/user'
import { setUserDetail } from '@/state/slices/userSlice'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const { token, username } = useSelector((state: RootState) => state.auth)
  const userDetail = useSelector((state: RootState) => state.user.detail)
  const dispatch = useDispatch()
  const router = useRouter()
  const params = useParams() as { username: string }

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }

    if (params.username !== username) {
      // If needed, redirect or handle viewing another user's profile
      // For now, we allow viewing anyway.
    }

    async function fetchData() {
      try {
        const data = await getUserDetails()
        dispatch(setUserDetail(data))
      } catch (error) {
        console.error(error)
      }
    }

    // Fetch user details if not already in store
    if (!userDetail) {
      fetchData()
    }
  }, [token, router, username, params.username, userDetail, dispatch])

  if (!userDetail) {
    return <div className="p-8">Loading profile...</div>
  }

  const { userProfile, contactNumbers, socialMediaAccounts, websites, media, locations } = userDetail
  const bannerImage = media.find(m => m.orderNo === 2)
  const profileImage = media.find(m => m.orderNo === 1)

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      {/* Banner */}
      {bannerImage && (
        <div className="w-full h-48 overflow-hidden rounded-md">
          <img src={bannerImage.url} alt="Banner" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Profile Image and Basic Info */}
      <div className="flex space-x-4 items-center">
        {profileImage && (
          <img 
            src={profileImage.url}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold">{userProfile.name}</h2>
          <p className="text-sm text-gray-600">@{userProfile.username}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold">Bio</h3>
        <p>{userProfile.bio}</p>
      </div>

      {/* Details */}
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
          <p>{userProfile.languages.map(l => l.name).join(', ')}</p>
        </div>
      </div>

      {/* Media Gallery */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Media Gallery</h3>
        <div className="flex gap-4 flex-wrap">
          {media.map(m => (
            <div key={m.id} className="w-32 h-32 overflow-hidden rounded-md">
              <img src={m.url} alt="User media" className="object-cover w-full h-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Contact Numbers */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Contact Numbers</h3>
        {contactNumbers.length === 0 ? <p>No contact numbers</p> : contactNumbers.map(cn => (
          <div key={cn.id} className="border p-2 rounded mb-2">
            <p><strong>Number:</strong> +{cn.countryCode}-{cn.number}</p>
            <p><strong>Apps:</strong> {cn.apps.map(a => a.name).join(', ')}</p>
            <p><strong>Private:</strong> {cn.isPrivate ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>

      {/* Social Media */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Social Media Accounts</h3>
        {socialMediaAccounts.length === 0 ? <p>No social media accounts</p> : socialMediaAccounts.map(sm => (
          <div key={sm.id} className="border p-2 rounded mb-2">
            <p><strong>Platform:</strong> {sm.platform.name}</p>
            <p><strong>URL:</strong> {sm.url}</p>
            <p><strong>Private:</strong> {sm.isPrivate ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>

      {/* Websites */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Websites</h3>
        {websites.length === 0 ? <p>No websites</p> : websites.map(w => (
          <div key={w.id} className="border p-2 rounded mb-2">
            <p><strong>URL:</strong> {w.url}</p>
            <p><strong>Private:</strong> {w.isPrivate ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>

      {/* Locations */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Locations</h3>
        {locations.length === 0 ? <p>No locations</p> : locations.map(loc => (
          <div key={loc.id} className="border p-2 rounded mb-2 flex items-center justify-between">
            <div>
              <p><strong>Name:</strong> {loc.name}</p>
              <p><strong>City:</strong> {loc.city.name}, {loc.city.state}, {loc.city.country}</p>
            </div>
            <div>{loc.isActive ? '✅' : ''}</div>
          </div>
        ))}
      </div>

    </div>
  )
}
