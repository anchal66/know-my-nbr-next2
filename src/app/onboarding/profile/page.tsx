'use client'

import { useEffect, useState, KeyboardEvent } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import { useRouter } from 'next/navigation'
import {
  submitOnboardingProfile,
  getGenders,
  getOrientations,
  getEthnicities,
  getNationalities,
  getLanguages,
  getHairColor,
} from '@/lib/onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'

// For icons (already in your package.json)
import { Info, User, Smile, CalendarDays, Globe } from 'lucide-react'
import Image from 'next/image'

// Additional UI from shadcn for searchable multi-select
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from '@/components/ui/command'

interface DropdownItem {
  id: number
  name: string
}

export default function OnboardingProfilePage() {
  const { onBoardingStatus, token } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  // --------------------------------------------------------------------------
  // State for form inputs
  // --------------------------------------------------------------------------
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')

  // Single-select numeric fields (can be null if user hasn’t selected)
  const [genderId, setGenderId] = useState<number | null>(null)
  const [orientationId, setOrientationId] = useState<number | null>(null)
  const [ethnicityId, setEthnicityId] = useState<number | null>(null)
  const [hairColorId, setHairColorId] = useState<number | null>(null)
  const [nationalityId, setNationalityId] = useState<number | null>(null)
  const [heightCm, setHeightCm] = useState<number | null>(null)

  // Multi-select for languages: store an array of IDs
  const [languageIds, setLanguageIds] = useState<number[]>([])

  // For controlling the popover & search
  const [languageSearch, setLanguageSearch] = useState('')   // text typed in the popover

  // --------------------------------------------------------------------------
  // State for dropdown data
  // --------------------------------------------------------------------------
  const [genders, setGenders] = useState<DropdownItem[]>([])
  const [orientations, setOrientations] = useState<DropdownItem[]>([])
  const [ethnicities, setEthnicities] = useState<DropdownItem[]>([])
  const [nationalities, setNationalities] = useState<DropdownItem[]>([])
  const [languages, setLanguages] = useState<DropdownItem[]>([])
  const [hairColors, setHairColors] = useState<DropdownItem[]>([])

  // --------------------------------------------------------------------------
  // Error handling
  // --------------------------------------------------------------------------
  const [errorMessage, setErrorMessage] = useState('')
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false) // controls the popover

  // --------------------------------------------------------------------------
  // Effects: check onboarding status & fetch dropdowns
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (onBoardingStatus === 'FINISHED') {
      router.push('/')
      return
    }

    async function fetchDropdowns() {
      try {
        const [
          fetchedGenders,
          fetchedOrientations,
          fetchedEthnicities,
          fetchedNationalities,
          fetchedLanguages,
          fetchedHairColors,
        ] = await Promise.all([
          getGenders(),
          getOrientations(),
          getEthnicities(),
          getNationalities(),
          getLanguages(),
          getHairColor(),
        ])

        setGenders(fetchedGenders)
        setOrientations(fetchedOrientations)
        setEthnicities(fetchedEthnicities)
        setNationalities(fetchedNationalities)
        setLanguages(fetchedLanguages)
        setHairColors(fetchedHairColors)
      } catch (error) {
        console.error('Error fetching dropdowns:', error)
      }
    }

    fetchDropdowns()
  }, [token, onBoardingStatus, router])

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------
  const validateForm = () => {
    if (!name.trim()) {
      setErrorMessage('Please enter your name.')
      return false
    }
    if (!dateOfBirth.trim()) {
      setErrorMessage('Please enter your date of birth.')
      return false
    }
    if (bio.trim().length < 50) {
      setErrorMessage('Your bio should be at least 50 characters.')
      return false
    }
    if (!genderId || !orientationId || !ethnicityId || !hairColorId || !nationalityId) {
      setErrorMessage('Please fill in all single-select dropdown fields.')
      return false
    }
    if (!heightCm || heightCm <= 0) {
      setErrorMessage('Please enter a valid height in cm.')
      return false
    }
    if (languageIds.length === 0) {
      setErrorMessage('Please select at least one language.')
      return false
    }

    setErrorMessage('')
    return true
  }

  // --------------------------------------------------------------------------
  // Handle submit
  // --------------------------------------------------------------------------
  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      // We'll use "!" to assert these are non-null, since validation checks them
      await submitOnboardingProfile({
        name,
        bio,
        dateOfBirth,
        genderId: genderId!,
        orientationId: orientationId!,
        ethnicityId: ethnicityId!,
        heightCm: heightCm!,
        hairColorId: hairColorId!,
        nationalityId: nationalityId!,
        languageIds,
      })
      // Move to Step 2
      router.push('/onboarding/private-data')
    } catch (error) {
      console.error('Profile submission error:', error)
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  // Pressing Enter can submit (optional)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  // --------------------------------------------------------------------------
  // Searching / selecting languages
  // --------------------------------------------------------------------------
  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(languageSearch.toLowerCase())
  )

  const toggleLanguage = (langId: number) => {
    setLanguageIds((prev) =>
      prev.includes(langId)
        ? prev.filter((id) => id !== langId)
        : [...prev, langId]
    )
  }

  // --------------------------------------------------------------------------
  // UI
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-neutral-900 text-brand-white">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto">
        {/* LEFT COLUMN: Guidance / Explanation */}
        <div className="flex flex-col justify-center p-6 md:p-12 border-b border-neutral-800 md:border-b-0 md:border-r border-neutral-700">
          <div className="flex flex-col items-center md:items-start">
            <Image
              src="/logo2.png"
              alt="Know My Nbr Logo"
              width={150}
              height={150}
              priority
              className="mb-4"
            />
            <h1 className="text-3xl font-bold text-brand-gold text-center md:text-left mb-2">
              Onboarding Step 1
            </h1>
            <p className="text-sm md:text-base text-gray-400 mb-4 text-center md:text-left">
              Public Profile
            </p>
          </div>

          <p className="hidden md:block text-sm md:text-base leading-6 text-gray-300">
            Let’s build your <strong>public</strong> profile so other users can discover you!
            Your <em>name</em>, <em>date of birth</em>, <em>bio</em>, and other details are shown
            to potential matches. Share enough info to stand out—feel free to use
            emojis in your bio!
          </p>

          <ul className="hidden md:flex flex-col gap-2 text-gray-200 mt-6">
            <li className="flex items-start gap-2">
              <User className="text-brand-gold mt-1" size={18} />
              <span className="text-sm md:text-base">
                <strong>Name</strong>: Appears in searches and your public profile.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CalendarDays className="text-brand-gold mt-1" size={18} />
              <span className="text-sm md:text-base">
                <strong>DOB</strong>: Helps others know your age.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Smile className="text-brand-gold mt-1" size={18} />
              <span className="text-sm md:text-base">
                <strong>Bio</strong>: At least 50 chars. Show your personality—emojis welcome!
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Globe className="text-brand-gold mt-1" size={18} />
              <span className="text-sm md:text-base">
                <strong>Languages</strong>: You can select multiple to broaden your reach.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="text-brand-gold mt-1" size={18} />
              <span className="text-sm md:text-base">
                Fill in all fields for better matching.
              </span>
            </li>
          </ul>
        </div>

        {/* RIGHT COLUMN: The Actual Form */}
        <div className="p-6 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-md p-4 bg-neutral-800 border border-gray-700 rounded shadow-md">
            <h2 className="text-2xl font-semibold text-brand-gold mb-4 text-center">
              Public Profile
            </h2>
            <p className="text-center text-sm text-gray-400 mb-6">
              Let others know who you are!
            </p>

            {errorMessage && (
              <p className="mb-4 text-center text-red-500 text-sm">
                {errorMessage}
              </p>
            )}

            {/* Name */}
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="mb-2 bg-neutral-700 border border-gray-700 text-gray-200"
            />

            {/* Bio as a TextArea */}
            <textarea
              placeholder="Tell us about yourself (≥ 50 characters). Emojis are welcome! 🥳"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              className="mb-2 w-full rounded-md border border-gray-700 bg-neutral-700 text-gray-200 p-2 outline-none focus:ring-1 focus:ring-brand-gold"
            />

            {/* Date of Birth */}
            <Input
              type="date"
              placeholder="Date of Birth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              onKeyDown={handleKeyDown}
              className="mb-2 bg-neutral-700 border border-gray-700 text-gray-200"
            />

            {/* Gender */}
            <Select onValueChange={(val) => setGenderId(Number(val))}>
              <SelectTrigger className="mb-2 bg-neutral-700 border border-gray-700 text-gray-200">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border border-gray-700 text-gray-200">
                {genders.map((g) => (
                  <SelectItem
                    key={g.id}
                    value={g.id.toString()}
                    className="hover:bg-neutral-700"
                  >
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Orientation */}
            <Select onValueChange={(val) => setOrientationId(Number(val))}>
              <SelectTrigger className="mb-2 bg-neutral-700 border border-gray-700 text-gray-200">
                <SelectValue placeholder="Select Orientation" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border border-gray-700 text-gray-200">
                {orientations.map((o) => (
                  <SelectItem
                    key={o.id}
                    value={o.id.toString()}
                    className="hover:bg-neutral-700"
                  >
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Ethnicity */}
            <Select onValueChange={(val) => setEthnicityId(Number(val))}>
              <SelectTrigger className="mb-2 bg-neutral-700 border border-gray-700 text-gray-200">
                <SelectValue placeholder="Select Ethnicity" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border border-gray-700 text-gray-200">
                {ethnicities.map((e) => (
                  <SelectItem
                    key={e.id}
                    value={e.id.toString()}
                    className="hover:bg-neutral-700"
                  >
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Height */}
            <Input
              type="number"
              placeholder="Height (cm)"
              value={heightCm ?? ''}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                setHeightCm(isNaN(val) ? null : val)
              }}
              onKeyDown={handleKeyDown}
              className="mb-2 bg-neutral-700 border border-gray-700 text-gray-200"
            />

            {/* Hair Color */}
            <Select onValueChange={(val) => setHairColorId(Number(val))}>
              <SelectTrigger className="mb-2 bg-neutral-700 border border-gray-700 text-gray-200">
                <SelectValue placeholder="Select Hair Color" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border border-gray-700 text-gray-200">
                {hairColors.map((h) => (
                  <SelectItem
                    key={h.id}
                    value={h.id.toString()}
                    className="hover:bg-neutral-700"
                  >
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Nationality */}
            <Select onValueChange={(val) => setNationalityId(Number(val))}>
              <SelectTrigger className="mb-2 bg-neutral-700 border border-gray-700 text-gray-200">
                <SelectValue placeholder="Select Nationality" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border border-gray-700 text-gray-200">
                {nationalities.map((n) => (
                  <SelectItem
                    key={n.id}
                    value={n.id.toString()}
                    className="hover:bg-neutral-700"
                  >
                    {n.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Multi-Select Languages with Searchable Popover */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-1">Languages (multi-select):</p>

              <Popover open={isLanguagesOpen} onOpenChange={setIsLanguagesOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-neutral-700 text-gray-200 border-gray-600 hover:bg-neutral-600">
                    {languageIds.length === 0
                      ? 'Select Languages'
                      : `Selected ${languageIds.length} language(s)...`
                    }
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="p-0 bg-neutral-800 border border-gray-700 text-gray-200 w-64">
                  <Command>
                    {/* The search input */}
                    <CommandInput
                      placeholder="Search languages..."
                      value={languageSearch}
                      onValueChange={(val) => setLanguageSearch(val)}
                      className="bg-neutral-900 text-gray-200 placeholder-gray-400 border-b border-gray-700"
                    />
                    <CommandEmpty>No languages found.</CommandEmpty>

                    <CommandList>
                      <CommandGroup>
                        {filteredLanguages.map((lang) => {
                          const isSelected = languageIds.includes(lang.id)
                          return (
                            <CommandItem
                              key={lang.id}
                              onSelect={() => toggleLanguage(lang.id)}
                              className="hover:bg-neutral-700"
                            >
                              <input
                                type="checkbox"
                                readOnly
                                checked={isSelected}
                                className="mr-2 accent-brand-gold"
                              />
                              <span>{lang.name}</span>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Submit Button */}
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
  )
}
