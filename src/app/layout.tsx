// src/lib/layout.tsx

import { Providers } from './providers';
import "./globals.css";
import { HeaderWrapper } from '@/components/layout/HeaderWrapper';
import { Footer } from '@/components/layout/Footer';
import GlobalSnackbar from '@/components/GlobalSnackBar';

export const metadata = {
  title: 'Know-My-Nbr | Redefining Dating',
  description: `KnowMyNbr is a cutting-edge dating application designed to connect you with nearby individuals effortlessly. Experience advanced features like distance-based user listings, direct connections without the hassle of swiping, and seamless sharing of contact information including phone numbers, Instagram, Facebook, LinkedIn, TikTok, and personal websites. Redefine your dating experience with Know-My-Nbr.`,
  keywords: 'know my nbr, knowmynbr, knowmyneighbour, know my neighbour, nbr, dating app, modern dating, connect nearby, distance-based dating, direct connections, share contact information, social dating app',
  authors: [{ name: 'Your Name', url: 'https://knowmynbr.com' }], // Replace with your actual name and website
  creator: 'Know My Nbr', // Replace with your actual name
  publisher: 'Know My Nbr',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://knowmynbr.com', // Replace with your actual website URL
    title: 'Know-My-Nbr | Redefining Dating',
    description: `KnowMyNbr is a cutting-edge dating application designed to connect you with nearby individuals effortlessly. Experience advanced features like distance-based user listings, direct connections without the hassle of swiping, and seamless sharing of contact information including phone numbers, Instagram, Facebook, LinkedIn, TikTok, and personal websites. Redefine your dating experience with Know-My-Nbr.`,
    siteName: 'Know My Nbr',
    images: [
      {
        url: 'https://www.knowmynbr.com/favicon.ico', // Replace with your actual image URL
        width: 1200,
        height: 630,
        alt: 'Know My Nbr - Redefining Dating',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Know-My-Nbr | Redefining Dating',
    description: `KnowMyNbr is a cutting-edge dating application designed to connect you with nearby individuals effortlessly. Experience advanced features like distance-based user listings, direct connections without the hassle of swiping, and seamless sharing of contact information including phone numbers, Instagram, Facebook, LinkedIn, TikTok, and personal websites. Redefine your dating experience with Know-My-Nbr.`,
    images: ['https://www.knowmynbr.com/favicon.ico'], // Replace with your actual image URL
    site: '@knowmynbr', // Replace with your actual Twitter handle
    creator: '@knowmynbr', // Replace with your actual Twitter handle
  },
  robots: 'index, follow',
  alternates: {
    canonical: 'https://knowmynbr.com', // Replace with your actual website URL
    languages: {
      'en-US': 'https://knowmynbr.com',
      // Add other language URLs if applicable
    },
  },
  icons: {
    icon: '/favicon.ico', // Replace with your actual favicon path
    shortcut: '/favicon-16x16.png', // Replace with your actual shortcut icon path
    apple: '/apple-touch-icon.png', // Replace with your actual Apple touch icon path
  },
};

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
