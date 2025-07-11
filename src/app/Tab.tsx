// File: src/app/Tab.tsx
// Commit: switch tab colors to GitHub-style green with darker background

'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSessionContext } from './SessionProvider'

const tabs = [
  { href: '/', label: 'Clock In' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/shifts', label: 'Shifts' },
  { href: '/chat', label: 'Team Chat' },
  { href: '/ai', label: 'AI Assistant' },
]

export default function Tab() {
  const pathname = usePathname()
  const { session } = useSessionContext()

  if (!session || !session.user) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b-4 border-green-700 flex justify-between items-center px-2 py-2">
      {tabs.map(({ href, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 text-center px-4 py-3 mx-1 rounded-md text-sm font-semibold border-2 transition-colors duration-200 ${
              active
                ? 'bg-green-600 text-white border-green-700'
                : 'bg-gray-800 text-white border-green-600 hover:bg-gray-700'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
