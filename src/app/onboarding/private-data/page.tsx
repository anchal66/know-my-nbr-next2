// src/app/onboarding/private-data/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import { useRouter } from 'next/navigation'
import {
  submitOnboardingPrivateData,
  getSocialMediaPlatforms,
  getMessagingApps
} from '@/lib/onboarding'
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

// ---------- NEW IMPORTS FOR VALIDATION & PHONE INPUT ----------
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'  // Required for default styles
// --------------------------------------------------------------

// You can also consider adding a more robust validation library 
// like 'react-hook-form' or 'yup' if you need more advanced validation.

interface MessagingApp {
  id: number
  name: string
}

interface SocialMediaPlatform {
  id: number
  name: string
}

// We will store the entire phone number in 'number' 
// and the library will handle the country code internally.
interface ContactNumberForm {
  number: string  // Full phone e.g. "+1 234 567 8901"
  countryCode: string  // Might not be needed with react-phone-input-2, but let's keep it to not break anything.
  appIds: number[]
  isPrivate: boolean
}

interface WebsiteForm {
  url: string
  isPrivate: boolean
}

interface SocialMediaForm {
  platformId: number | null
  url: string
  isPrivate: boolean
}

export default function OnboardingPrivateDataPage() {
  const { onBoardingStatus, token } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const [socialMediaPlatforms, setSocialMediaPlatforms] = useState<SocialMediaPlatform[]>([])
  const [messagingApps, setMessagingApps] = useState<MessagingApp[]>([])

  const [contactNumbers, setContactNumbers] = useState<ContactNumberForm[]>([
    { number: '', countryCode: '', appIds: [], isPrivate: false }
  ])
  const [websites, setWebsites] = useState<WebsiteForm[]>([
    { url: '', isPrivate: false }
  ])
  const [socialMediaAccounts, setSocialMediaAccounts] = useState<SocialMediaForm[]>([
    { platformId: null, url: '', isPrivate: false }
  ])

  // ---------- State for basic validation messages ----------
  const [contactError, setContactError] = useState<string>('')
  const [websiteError, setWebsiteError] = useState<string>('')
  const [socialMediaError, setSocialMediaError] = useState<string>('')
  // ---------------------------------------------------------

  useEffect(() => {
    if (onBoardingStatus === 'FINISHED') {
      router.push('/')
      return
    }

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

  // -------------------- Validation Helpers --------------------
  const isValidUrl = (str: string) => {
    // This is a simple regex for demonstration. 
    // Consider using a stronger validation if needed.
    // Also allows the possibility of "@" for social media.
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // optional protocol
      '((([a-zA-Z0-9\\-_]+)\\.)+[a-zA-Z]{2,})' + // domain name
      '(\\:[0-9]{1,5})?' + // optional port
      '(\\/.*)?$' // optional path
    )
    return urlPattern.test(str)
  }

  const isSocialMediaValid = (input: string) => {
    // either a valid URL or it starts with @
    if (!input.trim()) return false
    if (input.startsWith('@')) return true
    return isValidUrl(input)
  }
  // -----------------------------------------------------------

  // ---------------- Contact Numbers Handlers -----------------
  const addContactNumber = () => {
    // Check the last contactNumber is not empty before adding a new one
    const lastContact = contactNumbers[contactNumbers.length - 1]
    if (!lastContact.number) {
      setContactError('Please fill in the current phone number before adding another.')
      return
    }

    setContactError('')
    setContactNumbers((prev) => [
      ...prev,
      { number: '', countryCode: '', appIds: [], isPrivate: false }
    ])
  }

  const removeContactNumber = (index: number) => {
    setContactError('')
    setContactNumbers((prev) => prev.filter((_, i) => i !== index))
  }

  // We no longer need to handle countryCode and number separately 
  // because react-phone-input-2 will store entire phone in 'number'
  const updateContactNumberField = (index: number, field: keyof ContactNumberForm, value: any) => {
    setContactError('')
    setContactNumbers((prev) =>
      prev.map((cn, i) => (i === index ? { ...cn, [field]: value } : cn))
    )
  }
  // -----------------------------------------------------------

  // ---------------- Websites Handlers ------------------------
  const addWebsite = () => {
    // Check last website is not empty/invalid
    const lastWebsite = websites[websites.length - 1]
    if (!lastWebsite.url) {
      setWebsiteError('Please fill in the current Website before adding another.')
      return
    }
    if (lastWebsite.url && !isValidUrl(lastWebsite.url)) {
      setWebsiteError('Please provide a valid URL before adding another.')
      return
    }

    setWebsiteError('')
    setWebsites((prev) => [...prev, { url: '', isPrivate: false }])
  }

  const removeWebsite = (index: number) => {
    setWebsiteError('')
    setWebsites((prev) => prev.filter((_, i) => i !== index))
  }

  const updateWebsiteField = (index: number, field: keyof WebsiteForm, value: any) => {
    setWebsiteError('')
    setWebsites((prev) =>
      prev.map((w, i) => (i === index ? { ...w, [field]: value } : w))
    )
  }
  // -----------------------------------------------------------

  // ---------------- Social Media Handlers --------------------
  const addSocialMedia = () => {
    const lastSM = socialMediaAccounts[socialMediaAccounts.length - 1]
    // If last is empty or invalid
    if (!lastSM.url) {
      setSocialMediaError('Please fill in the current Social Media before adding another.')
      return
    }
    if (lastSM.url && !isSocialMediaValid(lastSM.url)) {
      setSocialMediaError('Please provide a valid URL or @username.')
      return
    }
    if (!lastSM.platformId) {
      setSocialMediaError('Please select a platform before adding another.')
      return
    }

    setSocialMediaError('')
    setSocialMediaAccounts((prev) => [
      ...prev,
      { platformId: null, url: '', isPrivate: false }
    ])
  }

  const removeSocialMedia = (index: number) => {
    setSocialMediaError('')
    setSocialMediaAccounts((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSocialMediaField = (
    index: number,
    field: keyof SocialMediaForm,
    value: any
  ) => {
    setSocialMediaError('')
    setSocialMediaAccounts((prev) =>
      prev.map((sm, i) => (i === index ? { ...sm, [field]: value } : sm))
    )
  }
  // -----------------------------------------------------------

  const handleSubmit = async () => {
    // Filter out empty inputs
    const filteredContactNumbers = contactNumbers.filter((cn) => cn.number.trim() !== '')
    const filteredWebsites = websites.filter((w) => w.url.trim() !== '')
    const filteredSocialMedia = socialMediaAccounts.filter(
      (sm) => sm.platformId && sm.url.trim() !== ''
    )

    // Optionally you can run a final validation pass here

    const payload = {
      contactNumbers: filteredContactNumbers,
      websites: filteredWebsites,
      socialMediaAccounts: filteredSocialMedia
    }

    try {
      await submitOnboardingPrivateData(payload)
      router.push('/onboarding/media')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-brand-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl text-brand-gold">Onboarding - Private Data</h1>

        {/* ------------------------------------
            CONTACT NUMBERS SECTION 
        --------------------------------------*/}
        <h2 className="text-xl text-brand-gold">Contact Numbers</h2>
        {contactNumbers.map((contact, index) => (
          <div key={index} className="mb-4 border border-gray-700 p-4 rounded space-y-4">
            
            {/* REACT-PHONE-INPUT-2 */}
            <div className="space-y-1">
              <label className="text-sm text-gray-400">
                Phone Number <span className="text-xs">(with Country Code)</span>
              </label>
              <PhoneInput
                country={'us'}
                value={contact.number}
                onChange={(phone) => {
                  updateContactNumberField(index, 'number', phone)
                  // If you want to extract country code separately:
                  // updateContactNumberField(index, 'countryCode', someParsingLogic(phone))
                }}
                inputClass="!bg-neutral-800 !border !border-gray-700 !text-gray-200 !w-full"
                buttonClass="!bg-neutral-700 !border !border-gray-600"
                // You can add more props or styling as needed
              />
              <p className="text-xs text-gray-500">
                Hint: Select a country from the dropdown, then enter your phone number.
              </p>
            </div>

            {/* MESSAGING APPS - now in a grid */}
            <div className="space-y-2">
              <p className="text-gray-300">Messaging Apps (Select any):</p>
              {/* Grid container */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {messagingApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center space-x-2 bg-neutral-800 p-2 rounded"
                  >
                    <Checkbox
                      checked={contact.appIds.includes(app.id)}
                      onCheckedChange={(checked) => {
                        let newAppIds = contact.appIds
                        if (checked) {
                          newAppIds = [...newAppIds, app.id]
                        } else {
                          newAppIds = newAppIds.filter((aId) => aId !== app.id)
                        }
                        updateContactNumberField(index, 'appIds', newAppIds)
                      }}
                      className="accent-brand-gold"
                    />
                    <label className="text-sm">{app.name}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* IS PRIVATE CHECKBOX */}
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={contact.isPrivate}
                onCheckedChange={(checked) =>
                  updateContactNumberField(index, 'isPrivate', !!checked)
                }
                className="accent-brand-gold"
              />
              <label>Private</label>
            </div>

            {index > 0 && (
              <Button variant="destructive" onClick={() => removeContactNumber(index)}>
                Remove Contact
              </Button>
            )}
          </div>
        ))}

        {contactError && <p className="text-red-500">{contactError}</p>}

        <Button
          variant="secondary"
          className="mb-4 border-gray-700 text-gray-200 hover:bg-neutral-700"
          onClick={addContactNumber}
        >
          Add Another Contact
        </Button>

        {/* ------------------------------------
            WEBSITES SECTION 
        --------------------------------------*/}
        <h2 className="text-xl text-brand-gold">Websites</h2>
        {websites.map((website, index) => (
          <div key={index} className="mb-4 border border-gray-700 p-4 rounded space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Website URL</label>
              <Input
                placeholder="e.g. https://my-website.com"
                value={website.url}
                onChange={(e) => updateWebsiteField(index, 'url', e.target.value)}
                className="bg-neutral-800 border border-gray-700 text-gray-200"
              />
              <p className="text-xs text-gray-500">
                Hint: Must be a valid URL including protocol (https://).
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={website.isPrivate}
                onCheckedChange={(checked) =>
                  updateWebsiteField(index, 'isPrivate', !!checked)
                }
                className="accent-brand-gold"
              />
              <label>Private</label>
            </div>

            {index > 0 && (
              <Button variant="destructive" onClick={() => removeWebsite(index)}>
                Remove Website
              </Button>
            )}
          </div>
        ))}

        {websiteError && <p className="text-red-500">{websiteError}</p>}

        <Button
          variant="secondary"
          className="mb-4 border-gray-700 text-gray-200 hover:bg-neutral-700"
          onClick={addWebsite}
        >
          Add Another Website
        </Button>

        {/* ------------------------------------
            SOCIAL MEDIA SECTION 
        --------------------------------------*/}
        <h2 className="text-xl text-brand-gold">Social Media Accounts</h2>
        {socialMediaAccounts.map((account, index) => (
          <div key={index} className="mb-4 border border-gray-700 p-4 rounded space-y-4">
            
            {/* SELECT PLATFORM */}
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Platform</label>
              <Select
                value={account.platformId ? account.platformId.toString() : ''}
                onValueChange={(val) => updateSocialMediaField(index, 'platformId', Number(val))}
              >
                <SelectTrigger className="bg-neutral-800 border border-gray-700 text-gray-200">
                  <SelectValue placeholder="Select Social Media Platform" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border border-gray-700 text-gray-200">
                  {socialMediaPlatforms.map((platform) => (
                    <SelectItem
                      key={platform.id}
                      value={platform.id.toString()}
                      className="hover:bg-neutral-700"
                    >
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* URL / @USERNAME */}
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Profile URL or @username</label>
              <Input
                placeholder="e.g. https://instagram.com/myprofile or @myprofile"
                value={account.url}
                onChange={(e) => updateSocialMediaField(index, 'url', e.target.value)}
                className="bg-neutral-800 border border-gray-700 text-gray-200"
              />
              <p className="text-xs text-gray-500">
                Hint: You can use a full URL (https://...) or an @username.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={account.isPrivate}
                onCheckedChange={(checked) =>
                  updateSocialMediaField(index, 'isPrivate', !!checked)
                }
                className="accent-brand-gold"
              />
              <label>Private</label>
            </div>

            {index > 0 && (
              <Button variant="destructive" onClick={() => removeSocialMedia(index)}>
                Remove Social Media
              </Button>
            )}
          </div>
        ))}

        {socialMediaError && <p className="text-red-500">{socialMediaError}</p>}

        <Button
          variant="secondary"
          className="mb-4 border-gray-700 text-gray-200 hover:bg-neutral-700"
          onClick={addSocialMedia}
        >
          Add Another Social Media
        </Button>

        {/* ------------------------------------
            SUBMIT BUTTON
        --------------------------------------*/}
        <Button
          className="bg-brand-gold text-black hover:brightness-110"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    </div>
  )
}
