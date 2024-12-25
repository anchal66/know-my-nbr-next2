
// src/components/SwipeFilterModal.tsx
'use client'

import React, { useState, useEffect } from 'react'
import * as Slider from '@radix-ui/react-slider'
import { SwipeFilters } from '@/lib/filters'
import { OptionItem } from '@/lib/swipeService'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'

interface SwipeFilterModalProps {
  onClose: () => void
  initialFilters: SwipeFilters
  genders: OptionItem[]
  orientations: OptionItem[]
  onSave: (newFilters: SwipeFilters) => void
}

export default function FilterModal({
  onClose,
  initialFilters,
  genders,
  orientations,
  onSave,
}: SwipeFilterModalProps) {
  const [distancePreference, setDistancePreference] = useState<number>(
    initialFilters.distancePreference
  )
  const [ageRange, setAgeRange] = useState<[number, number]>([
    initialFilters.ageMin,
    initialFilters.ageMax,
  ])
  const [selectedGenders, setSelectedGenders] = useState<number[]>(
    initialFilters.genderIds
  )
  const [selectedOris, setSelectedOris] = useState<number[]>(
    initialFilters.orientationIds
  )

  /** For multi-select. We'll store the array of selected IDs. */
  function handleGenderChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const opts = Array.from(e.target.selectedOptions).map((opt) =>
      Number(opt.value)
    )
    setSelectedGenders(opts)
  }

  function handleOrientationChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const opts = Array.from(e.target.selectedOptions).map((opt) =>
      Number(opt.value)
    )
    setSelectedOris(opts)
  }

  function handleSave() {
    let [ageMin, ageMax] = ageRange
    // Basic checks
    if (distancePreference < 1) setDistancePreference(1)
    if (distancePreference > 100) setDistancePreference(100)
    if (ageMin < 18) ageMin = 18
    if (ageMin > 80) ageMin = 80
    if (ageMax < 18) ageMax = 18
    if (ageMax > 80) ageMax = 80

    onSave({
      distancePreference,
      ageMin,
      ageMax,
      genderIds: selectedGenders,
      orientationIds: selectedOris,
    })
    onClose()
  }

  // If user manually toggles age slider, update local state
  const handleAgeSliderChange = (val: number[]) => {
    if (val.length === 2) {
      setAgeRange([val[0], val[1]])
    }
  }

  // If user manually toggles distance slider, update local state
  const handleDistanceSliderChange = (val: number[]) => {
    if (val.length === 1) {
      setDistancePreference(val[0])
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 p-6 rounded-lg shadow-lg w-full max-w-md space-y-6 text-white">
        <h2 className="text-2xl font-bold mb-2 text-center text-brand-gold">Filters</h2>
  
        {/* Distance Slider */}
        <div>
          <label className="block font-medium mb-1 text-sm">
            Distance: {distancePreference} km
          </label>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[distancePreference]}
            onValueChange={handleDistanceSliderChange}
            min={1}
            max={100}
            step={1}
          >
            <Slider.Track className="bg-gray-700 rounded-full flex-1 h-[4px]" />
            <Slider.Range className="absolute h-full bg-brand-gold rounded-full" />
            <Slider.Thumb className="block w-5 h-5 bg-brand-gold rounded-full focus:outline-none focus:ring-2 focus:ring-brand-gold" />
          </Slider.Root>
        </div>
  
        {/* Age Range Slider */}
        <div>
          <label className="block font-medium mb-1 text-sm">
            Age Range: {ageRange[0]} - {ageRange[1]}
          </label>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={ageRange}
            onValueChange={handleAgeSliderChange}
            min={18}
            max={80}
            step={1}
          >
            <Slider.Track className="bg-gray-700 rounded-full flex-1 h-[4px]" />
            <Slider.Range className="absolute h-full bg-brand-gold rounded-full" />
            <Slider.Thumb className="block w-5 h-5 bg-brand-gold rounded-full focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            <Slider.Thumb className="block w-5 h-5 bg-brand-gold rounded-full focus:outline-none focus:ring-2 focus:ring-brand-gold" />
          </Slider.Root>
        </div>
  
        {/* Genders */}
        <div>
          <label className="block font-medium mb-1 text-sm">Genders</label>
          <select
            multiple
            className="border border-gray-700 bg-neutral-800 w-full p-2 rounded h-28 text-white"
            value={selectedGenders.map(String)}
            onChange={handleGenderChange}
          >
            {genders.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
  
        {/* Orientations */}
        <div>
          <label className="block font-medium mb-1 text-sm">Orientations</label>
          <select
            multiple
            className="border border-gray-700 bg-neutral-800 w-full p-2 rounded h-28 text-white"
            value={selectedOris.map(String)}
            onChange={handleOrientationChange}
          >
            {orientations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
  
        {/* Buttons */}
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Apply</Button>
        </div>
      </div>
    </div>
  )  
}

