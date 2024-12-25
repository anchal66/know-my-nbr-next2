// src/app/(onboarding)/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
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
} from "@/components/ui/select"

export default function OnboardingProfilePage() {
  const { onBoardingStatus, token } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [genderId, setGenderId] = useState<number | null>(null)
  const [orientationId, setOrientationId] = useState<number | null>(null)
  const [ethnicityId, setEthnicityId] = useState<number | null>(null)
  const [heightCm, setHeightCm] = useState<number | null>(null)
  const [hairColorId, setHairColorId] = useState<number | null>(null)
  const [nationalityId, setNationalityId] = useState<number | null>(null)
  const [languageId, setLanguageId] = useState<number | null>(null)

  const [genders, setGenders] = useState<{id:number, name:string}[]>([])
  const [orientations, setOrientations] = useState<{id:number, name:string}[]>([])
  const [ethnicities, setEthnicities] = useState<{id:number, name:string}[]>([])
  const [nationalities, setNationalities] = useState<{id:number, name:string}[]>([])
  const [languages, setLanguages] = useState<{id:number, name:string}[]>([])
  const [hairColors, setHairColors] = useState<{id:number, name:string}[]>([])

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }
    if (onBoardingStatus === 'FINISHED') {
      router.push('/')
      return
    }

    async function fetchDropdowns() {
      const [
        fetchedGenders, 
        fetchedOrientations, 
        fetchedEthnicities, 
        fetchedNationalities, 
        fetchedLanguages,
        fetchedHairColors
      ] = await Promise.all([
        getGenders(),
        getOrientations(),
        getEthnicities(),
        getNationalities(),
        getLanguages(),
        getHairColor()
      ]);

      setGenders(fetchedGenders)
      setOrientations(fetchedOrientations)
      setEthnicities(fetchedEthnicities)
      setNationalities(fetchedNationalities)
      setLanguages(fetchedLanguages)
      setHairColors(fetchedHairColors)
    }

    fetchDropdowns()
  }, [token, onBoardingStatus, router])

  const handleSubmit = async () => {
    if (
      name && bio && dateOfBirth && 
      genderId && orientationId && ethnicityId && heightCm && hairColorId && nationalityId && languageId
    ) {
      try {
        await submitOnboardingProfile({
          name,
          bio,
          dateOfBirth,
          genderId,
          orientationId,
          ethnicityId,
          heightCm,
          hairColorId,
          nationalityId,
          languageIds: [languageId]
        })
        console.log("filled");
        // Move to Step 2
        router.push('/onboarding/private-data')
        console.log("Pushed");
      } catch (error) {
        console.error(error)
      }
    } else {
      alert('Please fill all required fields')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-brand-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl text-brand-gold mb-4">Onboarding - Public Profile</h1>
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-2 bg-neutral-800 border border-gray-700 text-gray-200"
        />
        <Input
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mb-2 bg-neutral-800 border border-gray-700 text-gray-200"
        />
        <Input
          type="date"
          placeholder="Date of Birth"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="mb-2 bg-neutral-800 border border-gray-700 text-gray-200"
        />

        {/* Gender */}
        <Select onValueChange={(val) => setGenderId(Number(val))}>
          <SelectTrigger className="mb-2 bg-neutral-800 border border-gray-700 text-gray-200">
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
          <SelectTrigger className="mb-2 bg-neutral-800 border border-gray-700 text-gray-200">
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
          <SelectTrigger className="mb-2 bg-neutral-800 border border-gray-700 text-gray-200">
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

        <Input
          type="number"
          placeholder="Height (cm)"
          value={heightCm ?? ''}
          onChange={(e) => setHeightCm(Number(e.target.value))}
          className="mb-2 bg-neutral-800 border border-gray-700 text-gray-200"
        />

        {/* Hair Color */}
        <Select onValueChange={(val) => setHairColorId(Number(val))}>
          <SelectTrigger className="mb-2 bg-neutral-800 border border-gray-700 text-gray-200">
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
          <SelectTrigger className="mb-2 bg-neutral-800 border border-gray-700 text-gray-200">
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

        {/* Languages */}
        <Select onValueChange={(val) => setLanguageId(Number(val))}>
          <SelectTrigger className="mb-2 bg-neutral-800 border border-gray-700 text-gray-200">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-800 border border-gray-700 text-gray-200">
            {languages.map((l) => (
              <SelectItem
                key={l.id}
                value={l.id.toString()}
                className="hover:bg-neutral-700"
              >
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
