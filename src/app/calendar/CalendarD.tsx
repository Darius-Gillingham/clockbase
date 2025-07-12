// File: app/calendar/CalendarD.tsx
// Commit: calendar control bar for navigating weeks

'use client'

interface CalendarDProps {
  onPrev: () => void
  onNext: () => void
  label: string
}

export default function CalendarD({ onPrev, onNext, label }: CalendarDProps) {
  return (
    <div className="flex justify-between items-center px-4 py-2 border-b border-black dark:border-white">
      <button onClick={onPrev} className="px-4 py-1 bg-gray-200 dark:bg-gray-800">
        ◀ Previous
      </button>
      <h2 className="text-lg font-bold">
        Week of {label}
      </h2>
      <button onClick={onNext} className="px-4 py-1 bg-gray-200 dark:bg-gray-800">
        Next ▶
      </button>
    </div>
  )
}
