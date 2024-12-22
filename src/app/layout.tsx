// src/app/layout.tsx
import { Providers } from './providers';
import "./globals.css";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'My App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1 p-4">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

