'use client'

import PayrollCalendar from './PayrollCalendar'
import { useSessionContext } from '../SessionProvider'

export default function PayrollPage() {
  const { session } = useSessionContext()

  if (!session) return null

  return (
    <main className="flex flex-col items-center justify-center px-4 py-8 bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <PayrollCalendar />
    </main>
  )
}
