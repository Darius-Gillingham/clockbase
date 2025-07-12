// File: app/calendar/CalendarA.tsx
// Commit: remove duplicate week navigation bar and move logic to CalendarD

'use client'

export type CalendarDateClick = (date: Date) => void

export default function CalendarA({
  weekOffset,
  onDateClick,
}: {
  weekOffset: number
  onDateClick: CalendarDateClick
}) {
  const getStartOfWeek = (ref: Date) => {
    const copy = new Date(ref)
    copy.setDate(ref.getDate() - ref.getDay())
    return copy
  }

  const getWeekDays = (offset: number): Date[] => {
    const base = getStartOfWeek(new Date())
    base.setDate(base.getDate() + offset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      return d
    })
  }

  const days = getWeekDays(weekOffset)

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-grow overflow-x-auto overflow-y-hidden">
        <div className="flex h-full w-[1400px] min-w-full">
          {days.map((date) => {
            return (
              <div
                key={date.toDateString()}
                onClick={() => onDateClick(date)}
                className="flex-1 flex flex-col border-r border-black dark:border-white px-2 py-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <div className="font-bold text-center text-sm mb-2">
                  {date.getDate()} {date.toLocaleString('default', { weekday: 'short' })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
