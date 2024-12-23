import { Providers } from './providers';
import "./globals.css";
import { HeaderWrapper } from '@/components/layout/HeaderWrapper';
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
          <HeaderWrapper />
          <main className="flex-1 p-4">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
