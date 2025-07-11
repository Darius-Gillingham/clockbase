// File: src/calendar/page.tsx
// Commit: initial calendar route rendering CalendarView

'use client'

import CalendarView from './CalendarView'

export default function CalendarPage() {
  return (
    <main className="flex flex-col items-center justify-center px-4 py-8 space-y-6 bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <div className="w-full max-w-4xl">
        <CalendarView />
      </div>
    </main>
  )
}
