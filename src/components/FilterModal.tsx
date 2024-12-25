'use client'

import React, { useEffect, useState } from 'react'
import * as Slider from '@radix-ui/react-slider'
import clsx from 'clsx'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getOrientations,
  getHairColors,
  getNationalities,
  getEthnicities,
} from '@/lib/nbrDirect'

interface FilterData {
  orientationIds?: number[]
  hairColorIds?: number[]
  nationalityIds?: number[]
  ageMin?: number
  ageMax?: number
  name?: string
}

interface FilterModalProps {
  onClose: () => void
  onApply: (filters: FilterData) => void
  initialFilters?: FilterData
}

export default function FilterModal({
  onClose,
  onApply,
  initialFilters = {},
}: FilterModalProps) {
  const [orientations, setOrientations] = useState<{ id: number; name: string }[]>([])
  const [hairColors, setHairColors] = useState<{ id: number; name: string }[]>([])
  const [nationalities, setNationalities] = useState<{ id: number; name: string }[]>([])
  const [ethnicities, setEthnicities] = useState<{ id: number; name: string }[]>([]) // if needed

  // local state
  const [orientationIds, setOrientationIds] = useState<number[]>(
    initialFilters.orientationIds || []
  )
  const [hairColorIds, setHairColorIds] = useState<number[]>(
    initialFilters.hairColorIds || []
  )
  const [nationalityIds, setNationalityIds] = useState<number[]>(
    initialFilters.nationalityIds || []
  )
  const [ageRange, setAgeRange] = useState<[number, number]>([
    initialFilters.ageMin || 18,
    initialFilters.ageMax || 80,
  ])
  // If you want user name filter here:
  const [name, setName] = useState(initialFilters.name || '')

  // 1) Load some filter data
  useEffect(() => {
    Promise.all([getOrientations(), getHairColors(), getNationalities(), getEthnicities()])
      .then(([oRes, hRes, nRes, eRes]) => {
        setOrientations(oRes)
        setHairColors(hRes)
        setNationalities(nRes)
        setEthnicities(eRes)
      })
      .catch(console.error)
  }, [])

  // 2) For checkboxes
  function handleCheckboxChange(
    list: number[],
    setList: (val: number[]) => void,
    id: number,
    checked: boolean
  ) {
    if (checked) {
      setList([...list, id])
    } else {
      setList(list.filter((x) => x !== id))
    }
  }

  function handleAgeSliderChange(val: number[]) {
    if (val.length === 2) {
      setAgeRange([val[0], val[1]])
    }
  }

  // 3) On apply
  function handleApply() {
    let [ageMin, ageMax] = ageRange
    if (ageMin < 18) ageMin = 18
    if (ageMax > 80) ageMax = 80
    if (ageMax < ageMin) ageMax = ageMin

    onApply({
      orientationIds: orientationIds.length ? orientationIds : undefined,
      hairColorIds: hairColorIds.length ? hairColorIds : undefined,
      nationalityIds: nationalityIds.length ? nationalityIds : undefined,
      ageMin,
      ageMax,
      name: name.trim() || undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl p-6 rounded shadow-md relative space-y-6">
        <button className="absolute top-3 right-3" onClick={onClose}>
          X
        </button>
        <h2 className="text-2xl font-bold text-center">Advanced Filters</h2>

        {/* Name filter (if you want name here) */}
        <div>
          <label className="block font-medium text-sm mb-1">Name</label>
          <Input
            placeholder="Search by name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Age range slider */}
        <div>
          <label className="block font-medium text-sm mb-1">
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
            <Slider.Track className="bg-gray-200 rounded-full flex-1 h-[4px]" />
            <Slider.Range className="absolute h-full bg-blue-500 rounded-full" />
            <Slider.Thumb
              className={clsx(
                'block w-5 h-5 bg-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400'
              )}
            />
            <Slider.Thumb
              className={clsx(
                'block w-5 h-5 bg-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400'
              )}
            />
          </Slider.Root>
        </div>

        {/* Orientations */}
        <div>
          <p className="font-medium text-sm mb-1">Orientation</p>
          <div className="flex flex-wrap gap-3">
            {orientations.map((o) => (
              <label key={o.id} className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={orientationIds.includes(o.id)}
                  onChange={(e) =>
                    handleCheckboxChange(
                      orientationIds,
                      setOrientationIds,
                      o.id,
                      e.target.checked
                    )
                  }
                />
                <span>{o.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Hair Colors */}
        <div>
          <p className="font-medium text-sm mb-1">Hair Color</p>
          <div className="flex flex-wrap gap-3">
            {hairColors.map((h) => (
              <label key={h.id} className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={hairColorIds.includes(h.id)}
                  onChange={(e) =>
                    handleCheckboxChange(
                      hairColorIds,
                      setHairColorIds,
                      h.id,
                      e.target.checked
                    )
                  }
                />
                <span>{h.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nationalities */}
        <div>
          <p className="font-medium text-sm mb-1">Nationality</p>
          <div className="flex flex-wrap gap-3">
            {nationalities.map((n) => (
              <label key={n.id} className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={nationalityIds.includes(n.id)}
                  onChange={(e) =>
                    handleCheckboxChange(
                      nationalityIds,
                      setNationalityIds,
                      n.id,
                      e.target.checked
                    )
                  }
                />
                <span>{n.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </div>
      </div>
    </div>
  )
}
