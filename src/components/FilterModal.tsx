// src/app/nbr-direct/FilterModal.tsx
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"

import {
  getGenders,
  getOrientations,
  getHairColors,
  getNationalities,
  getEthnicities,
} from '@/lib/nbrDirect'

interface OptionItem {
  id: number
  name: string
}

interface FilterModalProps {
  onClose: () => void
  onApply: (filters: {
    genderIds?: number[],
    hairColorIds?: number[],
    orientationIds?: number[],
    nationalityIds?: number[],
    ageMin?: number,
    ageMax?: number
  }) => void
}

export default function FilterModal({ onClose, onApply }: FilterModalProps) {
  const [genders, setGenders] = useState<OptionItem[]>([])
  const [orientations, setOrientations] = useState<OptionItem[]>([])
  const [hairColors, setHairColors] = useState<OptionItem[]>([])
  const [nationalities, setNationalities] = useState<OptionItem[]>([])
  const [ethnicities, setEthnicities] = useState<OptionItem[]>([]) // if needed

  // local filter states
  const [selectedGenders, setSelectedGenders] = useState<number[]>([])
  const [selectedOrientations, setSelectedOrientations] = useState<number[]>([])
  const [selectedHairColors, setSelectedHairColors] = useState<number[]>([])
  const [selectedNationalities, setSelectedNationalities] = useState<number[]>([])
  const [ageMin, setAgeMin] = useState<number | undefined>(undefined)
  const [ageMax, setAgeMax] = useState<number | undefined>(undefined)

  useEffect(() => {
    // fetch filter options in parallel
    Promise.all([
      getGenders(),
      getOrientations(),
      getHairColors(),
      getNationalities(),
      getEthnicities(),
    ]).then(([gRes, oRes, hRes, nRes, eRes]) => {
      setGenders(gRes)
      setOrientations(oRes)
      setHairColors(hRes)
      setNationalities(nRes)
      setEthnicities(eRes)
    }).catch(console.error)
  }, [])

  const handleApply = () => {
    onApply({
      genderIds: selectedGenders.length ? selectedGenders : undefined,
      orientationIds: selectedOrientations.length ? selectedOrientations : undefined,
      hairColorIds: selectedHairColors.length ? selectedHairColors : undefined,
      nationalityIds: selectedNationalities.length ? selectedNationalities : undefined,
      ageMin,
      ageMax,
    })
  }

  // We'll demonstrate a simple approach with multi-select boxes or individual selects for each category.
  // In real UI, you might have checkboxes for each item or multiple `Select`.

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-4 w-full max-w-lg rounded-md relative">
        <button className="absolute top-2 right-2 text-sm" onClick={onClose}>X</button>
        <h2 className="text-xl font-bold mb-4">Filters</h2>

        {/* Age range */}
        <div className="flex items-center space-x-2 mb-4">
          <Input
            type="number"
            placeholder="Age Min"
            value={ageMin ?? ''}
            onChange={(e) => setAgeMin(e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            type="number"
            placeholder="Age Max"
            value={ageMax ?? ''}
            onChange={(e) => setAgeMax(e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        {/* Genders */}
        <label className="block font-semibold mb-1">Genders</label>
        <MultiSelect
          options={genders}
          selected={selectedGenders}
          onChange={setSelectedGenders}
        />

        {/* Orientations */}
        <label className="block font-semibold mb-1 mt-4">Orientations</label>
        <MultiSelect
          options={orientations}
          selected={selectedOrientations}
          onChange={setSelectedOrientations}
        />

        {/* Hair colors */}
        <label className="block font-semibold mb-1 mt-4">Hair Colors</label>
        <MultiSelect
          options={hairColors}
          selected={selectedHairColors}
          onChange={setSelectedHairColors}
        />

        {/* Nationalities */}
        <label className="block font-semibold mb-1 mt-4">Nationalities</label>
        <MultiSelect
          options={nationalities}
          selected={selectedNationalities}
          onChange={setSelectedNationalities}
        />

        {/* (Ethnicities if needed) */}
        {/* <label className="block font-semibold mb-1 mt-4">Ethnicities</label>
        <MultiSelect
          options={ethnicities}
          selected={selectedEthnicities}
          onChange={setSelectedEthnicities}
        /> */}

        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={handleApply}>Apply</Button>
        </div>
      </div>
    </div>
  )
}

/**
 * A simple multi-select. 
 * For demonstration, we'll create a custom component that uses checkboxes.
 * Alternatively, you could use a more sophisticated approach with 
 * shadcn/ui or Radix multi-select patterns.
 */
function MultiSelect({
  options,
  selected,
  onChange,
}: {
  options: { id: number; name: string }[]
  selected: number[]
  onChange: (val: number[]) => void
}) {
  const handleCheckbox = (id: number, checked: boolean) => {
    if (checked) {
      onChange([...selected, id])
    } else {
      onChange(selected.filter(item => item !== id))
    }
  }

  return (
    <div className="space-y-1">
      {options.map((opt) => (
        <div key={opt.id} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selected.includes(opt.id)}
            onChange={(e) => handleCheckbox(opt.id, e.target.checked)}
          />
          <label>{opt.name}</label>
        </div>
      ))}
    </div>
  )
}
