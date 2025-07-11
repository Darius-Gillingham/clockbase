// File: src/app/layout.tsx
// Commit: implement filing cabinet drawer layout with stacked collapsible panels

import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from './SessionProvider'
import Link from 'next/link'
import { Geist, Geist_Mono } from 'next/font/google'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

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
          <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
            <div className="w-full max-w-4xl mx-auto flex flex-col border-l border-r border-black dark:border-white">
              {/* Filing cabinet drawer headers */}
              <div className="flex flex-col border-b border-black dark:border-white divide-y divide-black dark:divide-white">
                <DrawerHeader href="/" label="🕒 Clock In" />
                <DrawerHeader href="/calendar" label="📆 Calendar" />
                <DrawerHeader href="/shifts" label="🧱 Shifts" />
                <DrawerHeader href="/chat" label="💬 Team Chat" />
                <DrawerHeader href="/ai" label="🤖 AI Assistant" />
              </div>

              {/* Drawer content */}
              <main className="flex-grow w-full px-4 py-6">{children}</main>
            </div>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}

function DrawerHeader({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="w-full px-4 py-3 text-left text-lg font-semibold hover:bg-blue-100 dark:hover:bg-blue-900 transition"
    >
      {label}
    </Link>
  )
}
