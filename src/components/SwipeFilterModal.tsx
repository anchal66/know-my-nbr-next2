
// src/components/SwipeFilterModal.tsx
'use client'

import React, { useState } from 'react'
import { SwipeFilters } from '@/lib/filters'
import { OptionItem } from '@/lib/swipeService'
import { Button } from '@/components/ui/button'

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
  const [distancePreference, setDistancePreference] = useState<number>(initialFilters.distancePreference)
  const [ageMin, setAgeMin] = useState<number>(initialFilters.ageMin)
  const [ageMax, setAgeMax] = useState<number>(initialFilters.ageMax)
  const [genderIds, setGenderIds] = useState<number[]>(initialFilters.genderIds)
  const [orientationIds, setOrientationIds] = useState<number[]>(initialFilters.orientationIds)

  function toggleSelection(id: number, list: number[], setList: (arr: number[]) => void) {
    if (list.includes(id)) {
      setList(list.filter((val) => val !== id))
    } else {
      setList([...list, id])
    }
  }

  function handleSave() {
    // Basic checks
    if (distancePreference < 1) setDistancePreference(1)
    if (distancePreference > 100) setDistancePreference(100)
    if (ageMin < 18) setAgeMin(18)
    if (ageMin > 80) setAgeMin(80)
    if (ageMax < 18) setAgeMax(18)
    if (ageMax > 80) setAgeMax(80)

    onSave({
      distancePreference,
      ageMin,
      ageMax,
      genderIds,
      orientationIds,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold mb-2">Filters</h2>
        
        {/* Distance */}
        <div>
          <label className="block font-medium mb-1">Distance (1-100 km)</label>
          <input
            type="number"
            min={1}
            max={100}
            value={distancePreference}
            onChange={(e) => setDistancePreference(Number(e.target.value))}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Age Range */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block font-medium mb-1">Min Age (18-80)</label>
            <input
              type="number"
              min={18}
              max={80}
              value={ageMin}
              onChange={(e) => setAgeMin(Number(e.target.value))}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Max Age (18-80)</label>
            <input
              type="number"
              min={18}
              max={80}
              value={ageMax}
              onChange={(e) => setAgeMax(Number(e.target.value))}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        {/* Genders */}
        <div>
          <label className="block font-medium mb-1">Genders</label>
          <div className="flex flex-wrap gap-2">
            {genders.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`px-3 py-1 border rounded ${
                  genderIds.includes(g.id) ? 'bg-blue-200' : 'bg-gray-100'
                }`}
                onClick={() => toggleSelection(g.id, genderIds, setGenderIds)}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {/* Orientations */}
        <div>
          <label className="block font-medium mb-1">Orientations</label>
          <div className="flex flex-wrap gap-2">
            {orientations.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`px-3 py-1 border rounded ${
                  orientationIds.includes(o.id) ? 'bg-blue-200' : 'bg-gray-100'
                }`}
                onClick={() => toggleSelection(o.id, orientationIds, setOrientationIds)}
              >
                {o.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
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
