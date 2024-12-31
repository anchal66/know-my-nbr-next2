'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import { useRouter } from 'next/navigation'

// Onboarding-related imports
import {
  submitOnboardingPrivateData,
  getSocialMediaPlatforms,
  getMessagingApps
} from '@/lib/onboarding'

import { getUserCountryCode } from '@/lib/geo'

// UI components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

// 3rd-party phone input
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

import Image from 'next/image'
import { Smartphone, Globe2, Share2, WifiOff } from 'lucide-react'

interface MessagingApp {
  id: number
  name: string
}

interface SocialMediaPlatform {
  id: number
  name: string
}

interface ContactNumberForm {
  number: string
  countryCode: string
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

  // ---------------------------------------------------------
  //           State: Social / Messaging Platforms
  // ---------------------------------------------------------
  const [socialMediaPlatforms, setSocialMediaPlatforms] = useState<SocialMediaPlatform[]>([])
  const [messagingApps, setMessagingApps] = useState<MessagingApp[]>([])

  // Country code for phone input
  const [defaultCountry, setDefaultCountry] = useState<string>('us')

  // ---------------------------------------------------------
  //           Form State
  // ---------------------------------------------------------
  const [contactNumbers, setContactNumbers] = useState<ContactNumberForm[]>([
    { number: '', countryCode: '', appIds: [], isPrivate: false }
  ])
  const [websites, setWebsites] = useState<WebsiteForm[]>([
    { url: '', isPrivate: false }
  ])
  const [socialMediaAccounts, setSocialMediaAccounts] = useState<SocialMediaForm[]>([
    { platformId: null, url: '', isPrivate: false }
  ])

  // Validation error messages for each section
  const [contactError, setContactError] = useState('')
  const [websiteError, setWebsiteError] = useState('')
  const [socialMediaError, setSocialMediaError] = useState('')

  // ---------------------------------------------------------
  //           useEffect: Check onboarding & fetch data
  // ---------------------------------------------------------
  useEffect(() => {
    if (onBoardingStatus === 'FINISHED') {
      router.push('/')
      return
    }

    async function init() {
      // 1) Try fetching user country code
      try {
        const userCountry = await getUserCountryCode() // e.g., 'in' or 'us'
        setDefaultCountry(userCountry || 'us')
      } catch {
        setDefaultCountry('us') // fallback if geo fails
      }

      // 2) Fetch social media + messaging apps
      try {
        const [fetchedSocialMedia, fetchedApps] = await Promise.all([
          getSocialMediaPlatforms(),
          getMessagingApps()
        ])
        setSocialMediaPlatforms(fetchedSocialMedia)
        setMessagingApps(fetchedApps)
      } catch (error) {
        console.error('Error fetching social/messaging data:', error)
      }
    }
    init()
  }, [token, onBoardingStatus, router])

  // ---------------------------------------------------------
  //          Helpers: Validation
  // ---------------------------------------------------------
  const isValidUrl = (str: string) => {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // optional protocol
      '((([a-zA-Z0-9\\-_]+)\\.)+[a-zA-Z]{2,})' + // domain
      '(\\:[0-9]{1,5})?' + // optional port
      '(\\/.*)?$'          // optional path
    )
    return urlPattern.test(str)
  }

  // Accept either valid URL or an '@' handle
  const isSocialMediaValid = (input: string) => {
    if (!input.trim()) return false
    if (input.startsWith('@')) return true
    return isValidUrl(input)
  }

  // ---------------------------------------------------------
  //          Contact Numbers Handlers
  // ---------------------------------------------------------
  const addContactNumber = () => {
    // Must fill the last contact if user wants to add a new one
    const lastContact = contactNumbers[contactNumbers.length - 1]
    if (lastContact.number.trim() === '') {
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

  const updateContactNumberField = (
    index: number,
    field: keyof ContactNumberForm,
    value: any
  ) => {
    setContactError('')
    setContactNumbers((prev) =>
      prev.map((cn, i) => (i === index ? { ...cn, [field]: value } : cn))
    )
  }

  // ---------------------------------------------------------
  //          Website Handlers
  // ---------------------------------------------------------
  const addWebsite = () => {
    const lastWebsite = websites[websites.length - 1]
    if (lastWebsite.url.trim() === '') {
      setWebsiteError('Please fill in the current Website before adding another.')
      return
    }
    if (!isValidUrl(lastWebsite.url.trim())) {
      setWebsiteError('Please provide a valid URL (include https://) before adding another.')
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

  // ---------------------------------------------------------
  //          Social Media Handlers
  // ---------------------------------------------------------
  const addSocialMedia = () => {
    const lastSM = socialMediaAccounts[socialMediaAccounts.length - 1]
    if (!lastSM.platformId) {
      setSocialMediaError('Please select a platform before adding another.')
      return
    }
    if (!lastSM.url.trim()) {
      setSocialMediaError('Please fill in the current social media URL or @username.')
      return
    }
    if (!isSocialMediaValid(lastSM.url.trim())) {
      setSocialMediaError('Please provide a valid URL (with https://) or @username.')
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

  // ---------------------------------------------------------
  //       Filter out used social platforms in new rows
  // ---------------------------------------------------------
  //  If a user has selected 'Facebook' for one row, we remove it
  //  from the dropdown in new rows, so it can't be chosen again.
  const getAvailablePlatforms = (index: number) => {
    // Collect platformIds used in OTHER rows
    const usedIds = socialMediaAccounts
      .filter((_, i) => i !== index)
      .map((sm) => sm.platformId)
      .filter((id): id is number => id !== null)

    // Return all platforms that are not used
    return socialMediaPlatforms.filter(
      (platform) => !usedIds.includes(platform.id)
    )
  }

  // ---------------------------------------------------------
  //          Submit Handler
  // ---------------------------------------------------------
  const handleSubmit = async () => {
    // Filter out empty entries
    const filteredContactNumbers = contactNumbers.filter((c) => c.number.trim() !== '')
    const filteredWebsites = websites.filter((w) => w.url.trim() !== '')
    const filteredSocialMedia = socialMediaAccounts.filter(
      (sm) => sm.platformId && sm.url.trim() !== ''
    )

    // Build payload
    const payload = {
      contactNumbers: filteredContactNumbers,
      websites: filteredWebsites,
      socialMediaAccounts: filteredSocialMedia,
    }

    try {
      await submitOnboardingPrivateData(payload)
      router.push('/onboarding/media')
    } catch (error) {
      console.error('Error submitting private data:', error)
      // Optionally, set a global error if desired
    }
  }

  // ---------------------------------------------------------
  //          UI / Layout
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-neutral-900 text-brand-white">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto">
        {/* LEFT COLUMN: Guidance / Explanation */}
        <div className="flex flex-col justify-center p-6 md:p-12 border-b border-neutral-800 md:border-b-0 md:border-r border-neutral-700">
          <div className="flex flex-col items-center md:items-start mb-6">
            <Image
              src="/logo2.png"
              alt="Know My Nbr Logo"
              width={150}
              height={150}
              priority
              className="mb-4"
            />
            <h1 className="text-3xl font-bold text-brand-gold text-center md:text-left">
              Onboarding Step 2
            </h1>
            <p className="text-sm md:text-base text-gray-400 mb-4 text-center md:text-left">
              Private Data
            </p>
          </div>

          {/* Explanation for Larger Screens */}
          <div className="hidden md:block text-sm md:text-base leading-6 text-gray-300">
            <p className="mb-4">
              This information is <strong>private</strong> and will only be visible to 
              users who <em>follow</em> you or to whom you grant access. Feel free to 
              skip any section if you don't want to share.
            </p>
            <ul className="flex flex-col gap-2 text-gray-200">
              <li className="flex gap-2 items-start">
                <Smartphone className="text-brand-gold mt-1" />
                <span>
                  <strong>Contact Numbers:</strong> Add multiple phone numbers with 
                  associated messaging apps (WhatsApp, Telegram, etc.).
                </span>
              </li>
              <li className="flex gap-2 items-start">
                <Globe2 className="text-brand-gold mt-1" />
                <span>
                  <strong>Websites:</strong> Provide your blog, business page, 
                  or any personal site (optional).
                </span>
              </li>
              <li className="flex gap-2 items-start">
                <Share2 className="text-brand-gold mt-1" />
                <span>
                  <strong>Social Media:</strong> Link your profile URLs or 
                  @handles. Each platform can only be added <em>once</em>.
                </span>
              </li>
              <li className="flex gap-2 items-start">
                <WifiOff className="text-brand-gold mt-1" />
                <span>
                  You can leave everything blank if you want no private details shared.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: The Form Sections */}
        <div className="p-6 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-lg space-y-8 bg-neutral-800 border border-gray-700 p-4 rounded shadow-md">
            <h2 className="text-2xl font-semibold text-brand-gold text-center">
              Private Data
            </h2>
            <p className="text-center text-sm text-gray-400">
              (Visible only to your approved followers)
            </p>

            {/* =================== CONTACT NUMBERS =================== */}
            <div>
              <h3 className="text-xl text-brand-gold mb-2">Contact Numbers</h3>
              {contactNumbers.map((contact, index) => (
                <div
                  key={index}
                  className="mb-4 border border-gray-700 p-4 rounded space-y-4 bg-neutral-700"
                >
                  {/* PHONE INPUT */}
                  <div className="space-y-1">
                    <label className="text-sm text-gray-300">
                      Phone Number <span className="text-xs">(with Country Code)</span>
                    </label>
                    <PhoneInput
                      country={defaultCountry}
                      value={contact.number}
                      onChange={(phone, data: any) => {
                        updateContactNumberField(index, 'number', phone)
                        updateContactNumberField(index, 'countryCode', data.dialCode || '')
                      }}
                      containerStyle={{ backgroundColor: 'transparent' }}
                      inputStyle={{
                        backgroundColor: '#1f2937', // tailwind "bg-gray-800"
                        color: '#fff',
                        border: '1px solid #374151',
                        width: '100%'
                      }}
                      buttonStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151'
                      }}
                      dropdownStyle={{
                        backgroundColor: '#111827',
                        color: '#fff',
                        border: '1px solid #374151'
                      }}
                    />
                    <p className="text-xs text-gray-400">
                      Choose country then enter your number. 
                      Leave empty if you don't want to share.
                    </p>
                  </div>

                  {/* MESSAGING APPS */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">
                      Messaging Apps (Check any that apply):
                    </p>
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
                                newAppIds = newAppIds.filter((id) => id !== app.id)
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

                  {/* PRIVATE CHECKBOX */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={contact.isPrivate}
                      onCheckedChange={(checked) =>
                        updateContactNumberField(index, 'isPrivate', Boolean(checked))
                      }
                      className="accent-brand-gold"
                    />
                    <label className="text-sm text-gray-300">Mark as Private</label>
                    <p className="text-xs text-yellow-700">
                      Only followed users can see this phone number.
                    </p>
                  </div>

                  {/* REMOVE BUTTON (if not the only row) */}
                  {index > 0 && (
                    <Button
                      variant="destructive"
                      onClick={() => removeContactNumber(index)}
                    >
                      Remove Contact
                    </Button>
                  )}
                </div>
              ))}
              {contactError && (
                <p className="text-red-500 text-sm mb-2">{contactError}</p>
              )}
              <Button
                variant="secondary"
                className="border-gray-700 text-gray-200 hover:bg-neutral-600"
                onClick={addContactNumber}
              >
                Add Another Contact
              </Button>
            </div>

            {/* ====================== WEBSITES ======================= */}
            <div>
              <h3 className="text-xl text-brand-gold mb-2">Websites</h3>
              {websites.map((website, index) => (
                <div
                  key={index}
                  className="mb-4 border border-gray-700 p-4 rounded space-y-4 bg-neutral-700"
                >
                  <div className="space-y-1">
                    <label className="text-sm text-gray-300">Website URL</label>
                    <Input
                      placeholder="e.g. https://my-website.com"
                      value={website.url}
                      onChange={(e) => updateWebsiteField(index, 'url', e.target.value)}
                      className="bg-neutral-800 border border-gray-700 text-gray-200"
                    />
                    <p className="text-xs text-gray-400">
                      Include https://. Leave empty if you don’t have a site.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={website.isPrivate}
                      onCheckedChange={(checked) =>
                        updateWebsiteField(index, 'isPrivate', Boolean(checked))
                      }
                      className="accent-brand-gold"
                    />
                    <label className="text-sm text-gray-300">Mark as Private</label>
                    <p className="text-xs text-yellow-700">
                      Only followed users can see this website.
                    </p>
                  </div>

                  {/* REMOVE BUTTON */}
                  {index > 0 && (
                    <Button variant="destructive" onClick={() => removeWebsite(index)}>
                      Remove Website
                    </Button>
                  )}
                </div>
              ))}
              {websiteError && (
                <p className="text-red-500 text-sm mb-2">{websiteError}</p>
              )}
              <Button
                variant="secondary"
                className="border-gray-700 text-gray-200 hover:bg-neutral-600"
                onClick={addWebsite}
              >
                Add Another Website
              </Button>
            </div>

            {/* =============== SOCIAL MEDIA ACCOUNTS =============== */}
            <div>
              <h3 className="text-xl text-brand-gold mb-2">Social Media</h3>
              {socialMediaAccounts.map((account, index) => {
                // We remove any platforms used by other rows
                const availablePlatforms = getAvailablePlatforms(index)

                return (
                  <div
                    key={index}
                    className="mb-4 border border-gray-700 p-4 rounded space-y-4 bg-neutral-700"
                  >
                    {/* PLATFORM SELECT */}
                    <div className="space-y-1">
                      <label className="text-sm text-gray-300">Platform</label>
                      <Select
                        value={account.platformId ? account.platformId.toString() : ''}
                        onValueChange={(val) =>
                          updateSocialMediaField(index, 'platformId', Number(val))
                        }
                      >
                        <SelectTrigger className="bg-neutral-800 border border-gray-700 text-gray-200">
                          <SelectValue placeholder="Select Social Media Platform" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border border-gray-700 text-gray-200">
                          {availablePlatforms.map((platform) => (
                            <SelectItem
                              key={platform.id}
                              value={platform.id.toString()}
                              className="hover:bg-neutral-600"
                            >
                              {platform.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-400">
                        Once a platform is used, it won’t appear in new rows.
                      </p>
                    </div>

                    {/* URL or @username */}
                    <div className="space-y-1">
                      <label className="text-sm text-gray-300">
                        Profile URL or @username
                      </label>
                      <Input
                        placeholder="e.g. https://instagram.com/myprofile or @myprofile"
                        value={account.url}
                        onChange={(e) => updateSocialMediaField(index, 'url', e.target.value)}
                        className="bg-neutral-800 border border-gray-700 text-gray-200"
                      />
                      <p className="text-xs text-gray-400">
                        You can paste a full URL or just @username.
                      </p>
                    </div>

                    {/* PRIVATE CHECKBOX */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={account.isPrivate}
                        onCheckedChange={(checked) =>
                          updateSocialMediaField(index, 'isPrivate', Boolean(checked))
                        }
                        className="accent-brand-gold"
                      />
                      <label className="text-sm text-gray-300">Mark as Private</label>
                      <p className="text-xs text-yellow-700">
                        Only followed users can see this social handle.
                      </p>
                    </div>

                    {/* REMOVE BUTTON */}
                    {index > 0 && (
                      <Button
                        variant="destructive"
                        onClick={() => removeSocialMedia(index)}
                      >
                        Remove Social Media
                      </Button>
                    )}
                  </div>
                )
              })}
              {socialMediaError && (
                <p className="text-red-500 text-sm mb-2">{socialMediaError}</p>
              )}
              <Button
                variant="secondary"
                className="border-gray-700 text-gray-200 hover:bg-neutral-600"
                onClick={addSocialMedia}
              >
                Add Another Social Media
              </Button>
            </div>

            {/* ================= SUBMIT BUTTON ================= */}
            <div className="text-center pt-4">
              <Button
                className="bg-brand-gold text-black hover:brightness-110 w-full"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
