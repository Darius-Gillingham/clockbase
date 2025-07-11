// File: src/app/calendar/CalendarView.tsx
// Commit: add "Create Event" button and swap colors of Assign Shift and Set Availability

'use client'

import { useState } from 'react'
import { useSessionContext } from '../SessionProvider'

const toLocalDateKey = (date: Date): string =>
  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`

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

export default function CalendarView() {
  const { session } = useSessionContext()
  const [weekOffset, setWeekOffset] = useState(0)
  const [modalDate, setModalDate] = useState<Date | null>(null)

  const days = getWeekDays(weekOffset)

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 text-black dark:text-white relative">
      <div className="flex justify-between items-center px-4 py-2 border-b border-black dark:border-white">
        <button onClick={() => setWeekOffset(weekOffset - 1)} className="px-4 py-1 bg-gray-200 dark:bg-gray-800">
          ◀ Previous
        </button>
        <h2 className="text-lg font-bold">
          Week of {days[0].toLocaleString('default', { month: 'short', day: 'numeric' })}
        </h2>
        <button onClick={() => setWeekOffset(weekOffset + 1)} className="px-4 py-1 bg-gray-200 dark:bg-gray-800">
          Next ▶
        </button>
      </div>

      <div className="flex-grow overflow-x-auto overflow-y-hidden">
        <div className="flex h-full w-[1400px] min-w-full">
          {days.map((date) => {
            const key = toLocalDateKey(date)
            return (
              <div
                key={key}
                onClick={() => setModalDate(date)}
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

      {modalDate && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-gray-900 border border-black dark:border-white rounded-lg shadow-lg p-6 text-black dark:text-white z-10 pointer-events-auto">
            <h3 className="text-lg font-bold mb-4 text-center">
              {modalDate.toDateString()}
            </h3>
            <div className="flex flex-col gap-3">
              <button
                className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
                onClick={() => {
                  alert(`Set availability for ${modalDate.toDateString()}`)
                  setModalDate(null)
                }}
              >
                Set Availability
              </button>
              <button
                className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700"
                onClick={() => {
                  alert(`Assign shift on ${modalDate.toDateString()}`)
                  setModalDate(null)
                }}
              >
                Assign Shift
              </button>
              <button
                className="bg-purple-600 text-white py-2 px-6 rounded hover:bg-purple-700"
                onClick={() => {
                  alert(`Create event on ${modalDate.toDateString()}`)
                  setModalDate(null)
                }}
              >
                Create Event
              </button>
              <button
                className="text-red-600 underline mt-2 text-sm"
                onClick={() => setModalDate(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
