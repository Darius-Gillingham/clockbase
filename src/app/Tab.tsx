// File: src/app/Tab.tsx
// Commit: remove icons and update color scheme to green and dark gray

'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const tabs = [
  { href: '/', label: 'Clock In' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/shifts', label: 'Shifts' },
  { href: '/chat', label: 'Team Chat' },
  { href: '/ai', label: 'AI Assistant' },
]

export default function Tab() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b-4 border-green-400 flex justify-between items-center px-2 py-2">
      {tabs.map(({ href, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 text-center px-4 py-3 mx-1 rounded-md text-sm font-semibold border-2 transition-colors duration-200 ${
              active
                ? 'bg-green-300 text-gray-900 border-green-400'
                : 'bg-gray-800 text-white border-green-300 hover:bg-gray-700'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
