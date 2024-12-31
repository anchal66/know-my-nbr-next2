'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { XCircle, Upload, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'

// Import our new function from onboarding
import { uploadMediaWithProgress } from '@/lib/onboarding'

interface UploadedMedia {
  file: File
  previewUrl: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
}

export default function OnboardingMediaPage() {
  const { onBoardingStatus, token } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const [selectedFiles, setSelectedFiles] = useState<UploadedMedia[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // ----------------------------------------------------------------
  //  Check if user is finished with onboarding
  // ----------------------------------------------------------------
  useEffect(() => {
    if (onBoardingStatus === 'FINISHED') {
      router.push('/')
    }
  }, [onBoardingStatus, router, token])

  // ----------------------------------------------------------------
  //  Handle file selection: append new files
  // ----------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newArray: UploadedMedia[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      newArray.push({
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: 'pending',
      })
    }

    // Append, not overwrite
    setSelectedFiles((prev) => [...prev, ...newArray])
    setErrorMessage('')
  }

  // ----------------------------------------------------------------
  //  Remove one selected file from the local list
  // ----------------------------------------------------------------
  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // ----------------------------------------------------------------
  //  Submit images => upload in sequence
  // ----------------------------------------------------------------
  const handleUpload = async () => {
    // Must have at least 2 images
    if (selectedFiles.length < 2) {
      setErrorMessage('Please select at least 2 images before submitting.')
      return
    }

    setIsUploading(true)
    setErrorMessage('') // clear old errors

    for (let i = 0; i < selectedFiles.length; i++) {
      try {
        // Mark file as "uploading"
        updateFileStatus(i, 'uploading')

        // Perform the actual upload with progress
        await uploadMediaWithProgress(selectedFiles[i].file, i + 1, (p) => {
          updateFileProgress(i, p)
        })

        // If upload succeeded
        updateFileStatus(i, 'success')
      } catch (err) {
        console.error('Upload error for file index', i, err)
        updateFileStatus(i, 'error')
        setErrorMessage(
          'One or more images failed to upload. Please remove or fix them and try again.'
        )
        setIsUploading(false)
        return // Stop processing further files
      }
    }

    // If we made it here, all files are "success"
    setIsUploading(false)
    router.push('/onboarding/location')
  }

  // ----------------------------------------------------------------
  //  Update file status in local state
  // ----------------------------------------------------------------
  const updateFileStatus = (index: number, status: UploadedMedia['status']) => {
    setSelectedFiles((prev) =>
      prev.map((file, i) => (i === index ? { ...file, status } : file))
    )
  }

  // ----------------------------------------------------------------
  //  Update file progress in local state
  // ----------------------------------------------------------------
  const updateFileProgress = (index: number, progressValue: number) => {
    setSelectedFiles((prev) =>
      prev.map((file, i) => (i === index ? { ...file, progress: progressValue } : file))
    )
  }

  // ----------------------------------------------------------------
  //  Render
  // ----------------------------------------------------------------
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
              Onboarding Step 3
            </h1>
            <p className="text-sm md:text-base text-gray-400 mb-4 text-center md:text-left">
              Upload Your Media
            </p>
          </div>

          <p className="hidden md:block text-sm md:text-base leading-6 text-gray-300">
            Show off your best photos! Please upload at least two images. You can remove 
            any image before submitting. If any photo fails to upload, we’ll stop 
            so you can fix or remove it and try again.
          </p>
        </div>

        {/* RIGHT COLUMN: The Upload Form */}
        <div className="p-6 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-lg p-4 bg-neutral-800 border border-gray-700 rounded shadow-md space-y-6">
            <h2 className="text-2xl font-semibold text-brand-gold text-center">
              Upload Your Photos
            </h2>
            <p className="text-sm text-gray-400 text-center">
              (Minimum of 2 images required)
            </p>

            {/* Error Message (if any) */}
            {errorMessage && (
              <div className="bg-red-800 text-red-100 p-3 rounded flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}

            {/* File Input */}
            <div className="space-y-1">
              <label className="text-sm text-gray-300">Choose Images</label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="bg-neutral-700 border border-gray-700 text-gray-200"
              />
              <p className="text-xs text-gray-500">
                You can select multiple images. Each new selection is added to the list.
              </p>
            </div>

            {/* Previews */}
            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {selectedFiles.map((media, index) => (
                  <div
                    key={index}
                    className="relative w-full pt-[100%] bg-neutral-700 rounded overflow-hidden group"
                  >
                    {/* "X" remove button */}
                    <button
                      type="button"
                      className="z-50 absolute top-1 right-1 bg-black/40 text-red-500 p-1 rounded-full hover:bg-black/80 transition"
                      onClick={() => removeSelectedFile(index)}
                    >
                      <XCircle className="w-5 h-5" />
                    </button>

                    {/* Image preview */}
                    <Image
                      src={media.previewUrl}
                      alt={`preview-${index}`}
                      fill
                      className="object-cover"
                    />

                    {/* If uploading or done, show bottom overlay */}
                    {media.status !== 'pending' && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 flex items-center justify-between">
                        {media.status === 'uploading' && (
                          <div className="flex items-center gap-2 w-full">
                            <Loader2 className="animate-spin w-4 h-4" />
                            <span>{media.progress}%</span>
                            <div className="flex-1 bg-white/20 h-1 rounded">
                              <div
                                className="bg-green-400 h-1 rounded"
                                style={{ width: `${media.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {media.status === 'success' && (
                          <div className="flex items-center gap-1 text-green-400">
                            <ImageIcon className="w-4 h-4" />
                            <span>Uploaded</span>
                          </div>
                        )}
                        {media.status === 'error' && (
                          <div className="flex items-center gap-1 text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>Failed</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 bg-brand-gold text-black hover:brightness-110"
            >
              <Upload className="w-5 h-5" />
              {isUploading ? 'Uploading...' : 'Submit Images'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
