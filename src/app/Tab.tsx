// File: src/app/Tab.tsx
// Commit: top-level tab component with pathname detection and sticky horizontal UI

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { path: '/', label: '🕒 Clock In' },
  { path: '/calendar', label: '📆 Calendar' },
  { path: '/shifts', label: '📂 Shifts' },
  { path: '/chat', label: '💬 Team Chat' },
  { path: '/ai', label: '🤖 AI Assistant' },
]

export default function Tab() {
  const pathname = usePathname()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-md border-b border-yellow-400">
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
  )
}
