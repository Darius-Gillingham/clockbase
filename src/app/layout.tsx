// File: src/app/layout.tsx
// Commit: switch to fixed horizontal accordion drawer system with top panel tabs

import './globals.css'
import { SessionProvider } from './SessionProvider'
import Link from 'next/link'
import { Geist, Geist_Mono } from 'next/font/google'
import { usePathname } from 'next/navigation'

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <PanelTabs>{children}</PanelTabs>
        </SessionProvider>
      </body>
    </html>
  )
}

function PanelTabs({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const tabs = [
    { path: '/', label: '🕒 Clock In' },
    { path: '/calendar', label: '📆 Calendar' },
    { path: '/shifts', label: '📂 Shifts' },
    { path: '/chat', label: '💬 Team Chat' },
    { path: '/ai', label: '🤖 AI Assistant' },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Fixed tab drawer */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg border-b border-yellow-400">
        <div className="grid grid-cols-5 gap-2 px-2 py-2">
          {tabs.map(({ path, label }) => {
            const isActive = pathname === path
            return (
              <Link
                key={path}
                href={path}
                className={`text-sm sm:text-base md:text-lg text-center px-2 py-3 font-bold rounded-md border-2 transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-yellow-300 text-black border-yellow-400'
                    : 'bg-gray-800 text-white border-yellow-300 hover:bg-gray-700'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main content below sticky panel */}
      <main className="pt-[4.5rem] px-4 pb-12">{children}</main>
    </div>
  )
}
