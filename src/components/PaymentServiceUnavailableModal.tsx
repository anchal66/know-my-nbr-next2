'use client'

import React from 'react'
import DynamicSocialIcon from './DynamicSocialApp'

interface PaymentServiceUnavailableModalProps {
  onClose: () => void
}

export default function PaymentServiceUnavailableModal({
  onClose,
}: PaymentServiceUnavailableModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-neutral-900 text-white w-full max-w-md rounded p-6 shadow-lg space-y-4 relative">
        <h2 className="text-xl font-bold text-brand-gold">Payment Unavailable</h2>
        <p className="text-sm text-gray-300">
          Sorry, there is currently an issue with our payment service provider.  
          You can add funds to your wallet manually. 
        </p>
        <p className="text-sm text-gray-300">
          Please reach out to our support team:
        </p>

        {/* Email link */}
        <a
          href="mailto:support@knowmynbr.com"
          className="block text-brand-gold underline"
        >
          support@knowmynbr.com
        </a>

        {/* Telegram link using DynamicSocialIcon */}
        <div className="flex items-center space-x-2">
          <DynamicSocialIcon
            appName="telegram"
            url="https://t.me/anonavi12"
            size={30}
          />
          <a
            href="https://t.me/anonavi12"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-gold underline text-sm"
          >
            @anonavi12 (Telegram)
          </a>
        </div>

        <p className="text-xs text-gray-400">
          If you have any urgent concerns, please contact us via any of the above methods.
        </p>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="bg-brand-gold text-black px-4 py-2 rounded hover:brightness-110"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
