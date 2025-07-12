// File: app/calendar/CalendarA.tsx
// Commit: remove duplicate week navigation row

'use client'

import { useState } from 'react'

export type CalendarDateClick = (date: Date) => void

export default function CalendarA({
  weekOffset,
  setWeekOffset,
  onDateClick,
}: {
  weekOffset: number
  setWeekOffset: (n: number) => void
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
      <div className="flex justify-between items-center px-4 py-2 border-b border-black dark:border-white">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="px-4 py-1 bg-gray-200 dark:bg-gray-800"
        >
          ◀ Previous
        </button>
        <h2 className="text-lg font-bold">
          Week of {days[0].toLocaleString('default', { month: 'short', day: 'numeric' })}
        </h2>
        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="px-4 py-1 bg-gray-200 dark:bg-gray-800"
        >
          Next ▶
        </button>
      </div>

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
