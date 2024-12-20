'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import { useRouter } from 'next/navigation'
import { submitOnboardingPrivateData, getSocialMediaPlatforms, getMessagingApps } from '@/lib/onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Types
interface MessagingApp {
  id: number
  name: string
}

interface SocialMediaPlatform {
  id: number
  name: string
}

// Contact number structure in state
interface ContactNumberForm {
  number: string
  countryCode: string
  appIds: number[]  // multiple apps
  isPrivate: boolean
}

// Website structure in state
interface WebsiteForm {
  url: string
  isPrivate: boolean
}

// Social Media structure in state
interface SocialMediaForm {
  platformId: number | null
  url: string
  isPrivate: boolean
}

export default function OnboardingPrivateDataPage() {
  const { onBoardingStatus, token } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  // State for dropdown data
  const [socialMediaPlatforms, setSocialMediaPlatforms] = useState<SocialMediaPlatform[]>([])
  const [messagingApps, setMessagingApps] = useState<MessagingApp[]>([])

  // State for form fields
  const [contactNumbers, setContactNumbers] = useState<ContactNumberForm[]>([
    { number: '', countryCode: '+1', appIds: [], isPrivate: false }
  ])
  const [websites, setWebsites] = useState<WebsiteForm[]>([
    { url: '', isPrivate: false }
  ])
  const [socialMediaAccounts, setSocialMediaAccounts] = useState<SocialMediaForm[]>([
    { platformId: null, url: '', isPrivate: false }
  ])

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }
    if (onBoardingStatus === 'FINISHED') {
      router.push('/')
      return
    }
    if (onBoardingStatus === 'EMPTY') {
      router.push('/onboarding/profile') 
      return
    }
    // Here we assume onBoardingStatus is PROFILE or a later step, but not FINISHED.

    async function fetchOptions() {
      const [fetchedSocialMedia, fetchedApps] = await Promise.all([
        getSocialMediaPlatforms(),
        getMessagingApps()
      ])
      setSocialMediaPlatforms(fetchedSocialMedia)
      setMessagingApps(fetchedApps)
    }

    fetchOptions()
  }, [token, onBoardingStatus, router])

  // Contact number handlers
  const addContactNumber = () => {
    setContactNumbers((prev) => [...prev, { number: '', countryCode: '+1', appIds: [], isPrivate: false }])
  }

  const removeContactNumber = (index: number) => {
    setContactNumbers((prev) => prev.filter((_, i) => i !== index))
  }

  const updateContactNumberField = (index: number, field: keyof ContactNumberForm, value: any) => {
    setContactNumbers((prev) =>
      prev.map((cn, i) => i === index ? { ...cn, [field]: value } : cn)
    )
  }

  // Website handlers
  const addWebsite = () => {
    setWebsites((prev) => [...prev, { url: '', isPrivate: false }])
  }

  const removeWebsite = (index: number) => {
    setWebsites((prev) => prev.filter((_, i) => i !== index))
  }

  const updateWebsiteField = (index: number, field: keyof WebsiteForm, value: any) => {
    setWebsites((prev) =>
      prev.map((w, i) => i === index ? { ...w, [field]: value } : w)
    )
  }

  // Social Media handlers
  const addSocialMedia = () => {
    setSocialMediaAccounts((prev) => [...prev, { platformId: null, url: '', isPrivate: false }])
  }

  const removeSocialMedia = (index: number) => {
    setSocialMediaAccounts((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSocialMediaField = (index: number, field: keyof SocialMediaForm, value: any) => {
    setSocialMediaAccounts((prev) =>
      prev.map((sm, i) => i === index ? { ...sm, [field]: value } : sm)
    )
  }

  const handleSubmit = async () => {
    const filteredContactNumbers = contactNumbers.filter(cn => cn.number.trim() !== '')
    const filteredWebsites = websites.filter(w => w.url.trim() !== '')
    const filteredSocialMedia = socialMediaAccounts.filter(sm => sm.platformId && sm.url.trim() !== '')

    const payload = {
      contactNumbers: filteredContactNumbers,
      websites: filteredWebsites,
      socialMediaAccounts: filteredSocialMedia
    }

    try {
      await submitOnboardingPrivateData(payload)
      router.push('/') 
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl mb-4">Onboarding - Private Data</h1>

      {/* Contact Numbers Section */}
      <h2 className="text-xl mb-2">Contact Numbers</h2>
      {contactNumbers.map((contact, index) => (
        <div key={index} className="mb-4 border p-4 rounded space-y-2">
          <Input
            placeholder="Phone Number"
            value={contact.number}
            onChange={(e) => updateContactNumberField(index, 'number', e.target.value)}
          />
          <Input
            placeholder="Country Code"
            value={contact.countryCode}
            onChange={(e) => updateContactNumberField(index, 'countryCode', e.target.value)}
          />

          <div className="space-y-2">
            <p>Messaging Apps (Select any):</p>
            {messagingApps.map((app) => (
              <div key={app.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={contact.appIds.includes(app.id)}
                  onCheckedChange={(checked) => {
                    let newAppIds = contact.appIds
                    if (checked) {
                      newAppIds = [...newAppIds, app.id]
                    } else {
                      newAppIds = newAppIds.filter(aId => aId !== app.id)
                    }
                    updateContactNumberField(index, 'appIds', newAppIds)
                  }}
                />
                <label>{app.name}</label>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={contact.isPrivate}
              onCheckedChange={(checked) => updateContactNumberField(index, 'isPrivate', !!checked)}
            />
            <label>Private</label>
          </div>

          {index > 0 && (
            <Button variant="destructive" onClick={() => removeContactNumber(index)}>Remove Contact</Button>
          )}
        </div>
      ))}
      <Button variant="secondary" className="mb-4" onClick={addContactNumber}>Add Another Contact</Button>

      {/* Websites Section */}
      <h2 className="text-xl mb-2">Websites</h2>
      {websites.map((website, index) => (
        <div key={index} className="mb-4 border p-4 rounded space-y-2">
          <Input
            placeholder="Website URL"
            value={website.url}
            onChange={(e) => updateWebsiteField(index, 'url', e.target.value)}
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={website.isPrivate}
              onCheckedChange={(checked) => updateWebsiteField(index, 'isPrivate', !!checked)}
            />
            <label>Private</label>
          </div>

          {index > 0 && (
            <Button variant="destructive" onClick={() => removeWebsite(index)}>Remove Website</Button>
          )}
        </div>
      ))}
      <Button variant="secondary" className="mb-4" onClick={addWebsite}>Add Another Website</Button>

      {/* Social Media Section */}
      <h2 className="text-xl mb-2">Social Media Accounts</h2>
      {socialMediaAccounts.map((account, index) => (
        <div key={index} className="mb-4 border p-4 rounded space-y-2">
          <Select onValueChange={(val) => updateSocialMediaField(index, 'platformId', Number(val))}>
            <SelectTrigger className="mb-2">
              <SelectValue placeholder="Select Social Media Platform" />
            </SelectTrigger>
            <SelectContent>
              {socialMediaPlatforms.map((platform) => (
                <SelectItem key={platform.id} value={platform.id.toString()}>{platform.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Profile URL"
            value={account.url}
            onChange={(e) => updateSocialMediaField(index, 'url', e.target.value)}
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={account.isPrivate}
              onCheckedChange={(checked) => updateSocialMediaField(index, 'isPrivate', !!checked)}
            />
            <label>Private</label>
          </div>

          {index > 0 && (
            <Button variant="destructive" onClick={() => removeSocialMedia(index)}>Remove Social Media</Button>
          )}
        </div>
      ))}
      <Button variant="secondary" className="mb-4" onClick={addSocialMedia}>Add Another Social Media</Button>

      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  )
}
