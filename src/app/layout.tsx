// File: src/app/layout.tsx
// Commit: Add fixed-position settings/profile icon button in top-right corner

import './globals.css'
import { SessionProvider } from './SessionProvider'
import Tab from './Tab'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata = {
  title: 'Clockbase',
  description: 'AI-powered scheduling and shift tracking system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black text-black dark:text-white`}
      >
        <SessionProvider>
          <Tab />
          <main className="pt-[4.5rem] pb-12 px-2 sm:px-4 md:px-6 lg:px-8 max-w-screen-xl mx-auto w-full overflow-x-hidden">
            {children}
          </main>

          {/* Floating settings/profile icon in top-right */}
          <Link
            href="/profile"
            className="fixed top-4 right-4 z-50 p-2 rounded-full border-2 border-white bg-white dark:bg-black hover:scale-105 transition-transform"
          >
            <img
              src="/assets/settings-icon.png"
              alt="Settings"
              className="w-8 h-8"
            />
          </Link>
        </SessionProvider>
      </body>
    </html>
  )
}
