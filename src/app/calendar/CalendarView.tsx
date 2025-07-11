'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSessionContext } from '../SessionProvider'

interface Shift {
  shift_start: string
  shift_end: string | null
}

const toLocalDateKey = (date: Date): string =>
  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`

export default function CalendarView() {
  const { session } = useSessionContext()
  const [weekOffset, setWeekOffset] = useState(0)
  const [hoursByDay, setHoursByDay] = useState<Record<string, number>>({})
  const [modalDate, setModalDate] = useState<Date | null>(null)

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}h ${m}m`
  }

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

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return

      const userId = session.user.id
      const week = getWeekDays(weekOffset)
      const start = new Date(week[0])
      const end = new Date(week[6])
      end.setHours(23, 59, 59)

      const { data: shifts } = await supabase
        .from('Shifts')
        .select('shift_start, shift_end')
        .eq('User_ID', userId)
        .gte('shift_start', start.toISOString())
        .lte('shift_start', end.toISOString())

      const map: Record<string, number> = {}
      for (const shift of shifts || []) {
        if (!shift.shift_end) continue
        const s = new Date(shift.shift_start)
        const e = new Date(shift.shift_end)
        const mins = Math.floor((e.getTime() - s.getTime()) / 60000)
        const key = toLocalDateKey(s)
        map[key] = (map[key] || 0) + mins
      }

      setHoursByDay(map)
    }

    fetchData()
  }, [session, weekOffset])

  const days = getWeekDays(weekOffset)

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
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
            const mins = hoursByDay[key] || 0
            return (
              <div
                key={key}
                onClick={() => setModalDate(date)}
                className="flex-1 flex flex-col border-r border-black dark:border-white px-2 py-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <div className="font-bold text-center text-sm mb-2">
                  {date.getDate()} {date.toLocaleString('default', { weekday: 'short' })}
                </div>
                <div className="flex-grow flex items-center justify-center">
                  {mins > 0 ? (
                    <div className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {formatDuration(mins)}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">No shift</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {modalDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 border border-black dark:border-white rounded p-6 text-center text-black dark:text-white">
            <h3 className="text-lg font-bold mb-4">
              {modalDate.toDateString()}
            </h3>
            <div className="flex flex-col gap-3">
              <button
                className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
                onClick={() => {
                  alert(`Set availability for ${modalDate.toDateString()}`)
                  setModalDate(null)
                }}
              >
                Set Availability
              </button>
              <button
                className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  alert(`Assign shift on ${modalDate.toDateString()}`)
                  setModalDate(null)
                }}
              >
                Assign Shift
              </button>
              <button
                className="text-red-600 underline mt-2"
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
