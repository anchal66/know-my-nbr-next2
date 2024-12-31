// app/messages/layout.tsx
import React, { Suspense } from 'react'

// Also force dynamic rendering at the layout level
export const dynamic = 'force-dynamic'

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div>Loading Messages...</div>}>
      {children}
    </Suspense>
  )
}
