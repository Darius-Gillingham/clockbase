// File: src/app/layout.tsx
// Commit: replace body with visual filing cabinet layout and expandable drawer shell

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SessionProvider } from './SessionProvider'
import Link from 'next/link'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 text-black dark:text-white">

            {/* Drawer panel (filing cabinet handle area) */}
            <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-black dark:border-white bg-gray-100 dark:bg-gray-800">
              <nav className="flex md:flex-col justify-around md:justify-start gap-2 md:gap-4 p-4 text-sm font-medium">
                <Link href="/" className="hover:underline text-blue-600 dark:text-blue-400">🕒 Clock In</Link>
                <Link href="/calendar" className="hover:underline text-blue-600 dark:text-blue-400">📆 Calendar</Link>
                <Link href="/shifts" className="hover:underline text-blue-600 dark:text-blue-400">🧱 Shifts</Link>
                <Link href="/chat" className="hover:underline text-blue-600 dark:text-blue-400">💬 Team Chat</Link>
                <Link href="/ai" className="hover:underline text-blue-600 dark:text-blue-400">🤖 AI Assistant</Link>
              </nav>
            </aside>

            {/* Drawer content (active sheet view) */}
            <main className="flex-1 px-4 py-6">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
