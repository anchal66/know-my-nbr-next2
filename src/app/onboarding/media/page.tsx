// src/app/(onboarding)/media/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import { useRouter } from 'next/navigation'
import { uploadUserMedia } from '@/lib/onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

interface UploadedMedia {
  file: File
  previewUrl: string
}

export default function OnboardingMediaPage() {
  const { onBoardingStatus, token } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const [selectedFiles, setSelectedFiles] = useState<UploadedMedia[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    // if (!token) {
    //   router.push('/login')
    //   return
    // }
    // if (onBoardingStatus === 'FINISHED') {
    //   router.push('/')
    //   return
    // }
    // if (onBoardingStatus === 'EMPTY' || onBoardingStatus === 'PROFILE') {
    //   router.push('/onboarding/profile')
    //   return
    // }
    // if (onBoardingStatus === 'PROFILE') {
    //   router.push('/onboarding/private-data')
    //   return
    // }
    // By now we should be at least `PRIVATE_CONTACT` to access media step.
  }, [token, onBoardingStatus, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const fileArray: UploadedMedia[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      fileArray.push({
        file,
        previewUrl: URL.createObjectURL(file)
      })
    }
    setSelectedFiles(fileArray)
  }

  const handleUpload = async () => {
    if (selectedFiles.length < 2) {
      alert('Please select at least 2 images.')
      return
    }

    try {
      setIsUploading(true)
      for (let i = 0; i < selectedFiles.length; i++) {
        const media = selectedFiles[i]
        await uploadUserMedia(media.file, i + 1)
      }
      // After successful upload, go to Step 4 (Location)
      router.push('/onboarding/location')
    } catch (error) {
      console.error(error)
      alert('Error uploading images, please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-brand-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl text-brand-gold mb-4">Onboarding - Upload Your Media</h1>
        <p className="mb-4 text-gray-300">
          Please upload at least 2 images. You can upload multiple images and preview them here.
        </p>

        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="mb-4 bg-neutral-800 border border-gray-700 text-gray-200"
        />

        <div className="flex flex-wrap gap-4 mb-4">
          {selectedFiles.map((media, index) => (
            <div
              key={index}
              className="w-24 h-24 relative rounded overflow-hidden"
            >
              <Image
                src={media.previewUrl}
                alt={`preview-${index}`}
                fill
                className="object-cover rounded"
              />
            </div>
          ))}
        </div>

        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="bg-brand-gold text-black hover:brightness-110"
        >
          {isUploading ? 'Uploading...' : 'Submit Images'}
        </Button>
      </div>
    </div>
  )
}
