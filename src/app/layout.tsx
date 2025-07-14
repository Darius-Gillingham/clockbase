// File: src/app/layout.tsx
// Commit: Position profile icon with responsive bottom-right bounds and layer profile panel above all content

import './globals.css'
import { useState } from 'react'
import { SessionProvider } from './SessionProvider'
import Tab from './Tab'
import { Geist, Geist_Mono } from 'next/font/google'

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
  const [showProfilePanel, setShowProfilePanel] = useState(false)

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black text-black dark:text-white`}
      >
        <SessionProvider>
          <Tab />
          <main className="relative pt-[4.5rem] pb-12 px-2 sm:px-4 md:px-6 lg:px-8 max-w-screen-xl mx-auto w-full overflow-x-hidden">
            {children}

            {/* Profile icon with responsive bottom-right anchoring */}
            <div className="absolute z-40 bottom-6 right-6 sm:bottom-8 sm:right-8 md:bottom-10 md:right-10">
              <button
                onClick={() => setShowProfilePanel(true)}
                className="p-2 rounded-full border-2 border-white bg-white dark:bg-black hover:scale-105 transition-transform"
              >
                <img
                  src="/assets/profile-icon.png"
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              </button>
            </div>
          </main>

          {/* Profile panel (overlay layer) */}
          <div
            className={`fixed top-0 right-0 h-full w-80 max-w-full bg-white dark:bg-neutral-900 border-l border-black dark:border-white shadow-xl z-50 transform transition-transform duration-300 ${
              showProfilePanel ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-black dark:border-white">
              <h2 className="text-lg font-bold">Profile</h2>
              <button
                onClick={() => setShowProfilePanel(false)}
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:underline"
              >
                Close
              </button>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <p className="text-black dark:text-white">Signed in as: [username]</p>
              <hr className="border-black dark:border-white" />
              <p className="text-black dark:text-white">Settings and profile options coming soon...</p>
            </div>
          </div>

          {/* Background blocker (optional blur layer) */}
          {showProfilePanel && (
            <div
              className="fixed inset-0 z-40 bg-black bg-opacity-30 backdrop-blur-sm"
              onClick={() => setShowProfilePanel(false)}
            />
          )}
        </SessionProvider>
      </body>
    </html>
  )
}
