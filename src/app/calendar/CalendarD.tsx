// File: app/calendar/CalendarD.tsx
// Commit: migrate week navigation logic from CalendarA, preserve correct "Week of Jul 6" format

'use client'

interface CalendarDProps {
  weekOffset: number
  setWeekOffset: (n: number) => void
}

export default function CalendarD({ weekOffset, setWeekOffset }: CalendarDProps) {
  const getStartOfWeek = (ref: Date) => {
    const copy = new Date(ref)
    copy.setDate(ref.getDate() - ref.getDay())
    return copy
  }

  const getWeekLabel = (offset: number): string => {
    const base = getStartOfWeek(new Date())
    base.setDate(base.getDate() + offset * 7)
    return base.toLocaleString('default', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex justify-between items-center px-4 py-2 border-b border-black dark:border-white">
      <button
        onClick={() => setWeekOffset(weekOffset - 1)}
        className="px-4 py-1 bg-gray-200 dark:bg-gray-800"
      >
        ◀ Previous
      </button>
      <h2 className="text-lg font-bold">
        Week of {getWeekLabel(weekOffset)}
      </h2>
      <button
        onClick={() => setWeekOffset(weekOffset + 1)}
        className="px-4 py-1 bg-gray-200 dark:bg-gray-800"
      >
        Next ▶
      </button>
    </div>
  )
}
