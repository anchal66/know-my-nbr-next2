// src/lib/layout.tsx

import { Providers } from './providers';
import "./globals.css";
import { HeaderWrapper } from '@/components/layout/HeaderWrapper';
import { Footer } from '@/components/layout/Footer';
import GlobalSnackbar from '@/components/GlobalSnackBar';

export const metadata = {
  title: 'Know My Nbr',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='dark'>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <HeaderWrapper />
          <main className="flex-1 p-4">
          <GlobalSnackbar />
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
