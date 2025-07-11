'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ShiftAssigner from '@/shifts/ShiftAssigner'
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
  const [showAssigner, setShowAssigner] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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
  }, [session, weekOffset, showAssigner])

  const days = getWeekDays(weekOffset)

  const handleScrollLeft = () => {
    containerRef.current?.scrollBy({ left: -200, behavior: 'smooth' })
  }

  const handleScrollRight = () => {
    containerRef.current?.scrollBy({ left: 200, behavior: 'smooth' })
  }

  return (
    <div className="w-screen h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white overflow-hidden relative">
      <div className="flex justify-between items-center p-4 border-b border-black dark:border-white">
        <button onClick={() => setWeekOffset(weekOffset - 1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded">
          ◀ Previous
        </button>
        <h2 className="text-xl font-bold">
          Week of {days[0].toLocaleString('default', { month: 'short', day: 'numeric' })}
        </h2>
        <button onClick={() => setWeekOffset(weekOffset + 1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded">
          Next ▶
        </button>
      </div>

      <div className="relative h-[calc(100%-12rem)] overflow-x-auto" ref={containerRef}>
        <div className="absolute left-0 top-0 bottom-0 w-8 z-20 hover:cursor-pointer" onMouseEnter={handleScrollLeft} />
        <div className="absolute right-0 top-0 bottom-0 w-8 z-20 hover:cursor-pointer" onMouseEnter={handleScrollRight} />

        <div className="flex w-max px-4 space-x-4 pt-4 pb-6">
          {days.map((date) => {
            const key = toLocalDateKey(date)
            const mins = hoursByDay[key] || 0
            return (
              <div key={key} className="w-64 min-w-[16rem] h-full p-4 border rounded-lg bg-white dark:bg-gray-800 shadow flex flex-col justify-start">
                <div className="text-lg font-bold mb-2 text-center">
                  {date.getDate()} {date.toLocaleString('default', { weekday: 'short' })}
                </div>
                <div className="flex-grow flex flex-col justify-center items-center">
                  {mins > 0 ? (
                    <div className="rounded-full bg-blue-200 text-blue-800 px-3 py-1">
                      {formatDuration(mins)}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">No shift</div>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <button className="text-blue-600 underline">Edit</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          onClick={() => setShowAssigner(!showAssigner)}
        >
          {showAssigner ? 'Hide Shift Assigner' : 'Assign New Shift'}
        </button>
      </div>

      {showAssigner && (
        <div className="mt-4 px-4">
          <ShiftAssigner onClose={() => setShowAssigner(false)} />
        </div>
      )}

      <div className="text-center text-sm italic text-gray-500 mt-4">
        Optional month view could go here below
      </div>
    </div>
  )
}
