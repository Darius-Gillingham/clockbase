'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSessionContext } from './SessionProvider'
import {
  BotIcon,
  CalendarIcon,
  HomeIcon,
  MessageSquareIcon,
  DollarSignIcon,
} from 'lucide-react'

const tabs = [
  { href: '/ai', label: 'AI', Icon: BotIcon },
  { href: '/calendar', label: 'Calendar', Icon: CalendarIcon },
  { href: '/', label: 'Home', Icon: HomeIcon },
  { href: '/chat', label: 'Chat', Icon: MessageSquareIcon },
  { href: '/payroll', label: 'Payroll', Icon: DollarSignIcon },
]

export default function Tab() {
  const pathname = usePathname()
  const { session } = useSessionContext()

  if (!session || !session.user) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 grid grid-cols-5 h-[72px] bg-gray-900 border-b-4 border-green-700 font-serif">
      {tabs.map(({ href, label, Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center border-2 text-[0.65rem] sm:text-xs font-semibold tracking-tight truncate px-1 ${
              active
                ? 'bg-green-600 text-white border-green-700'
                : 'bg-gray-800 text-white border-green-600 hover:bg-gray-700'
            }`}
            style={{ wordBreak: 'keep-all', overflow: 'hidden' }}
          >
            <Icon className="h-5 w-5 mb-1 shrink-0" />
            <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
