// File: src/app/layout.tsx
// Commit: import Tab from app directory and render sticky horizontal nav

import './globals.css'
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
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <Tab />
          <main className="pt-[4.5rem] px-4 pb-12">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
