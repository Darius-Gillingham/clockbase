import './globals.css'
import { SessionProvider } from './SessionProvider'
import Tab from './Tab'
import { Geist, Geist_Mono } from 'next/font/google'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata = {
  title: 'Clockbase',
  description: 'AI-powered scheduling and shift tracking system',
  icons: {
    icon: '/favicon.png', // Path relative to /public
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black text-black dark:text-white`}
      >
        <SessionProvider>
          <Tab />
          <main className="pt-[4.5rem] pb-12 px-2 sm:px-4 md:px-6 lg:px-8 max-w-screen-xl mx-auto w-full overflow-x-hidden">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
