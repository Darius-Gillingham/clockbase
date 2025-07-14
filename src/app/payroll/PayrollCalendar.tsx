// File: app/calendar/PayrollCalendar.tsx
// Commit: Restyle day boxes with tab-style green border, thick outline, and tab font style

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

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

export default function PayrollCalendar() {
  const { session } = useSessionContext()
  const [weekOffset, setWeekOffset] = useState(0)
  const [hoursByDay, setHoursByDay] = useState<Record<string, number>>({})

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
    <div className="w-full h-full flex flex-col overflow-hidden bg-gray-50 text-black">
      <div className="flex justify-between items-center px-4 py-2 border-b border-black">
        <button onClick={() => setWeekOffset(weekOffset - 1)} className="px-4 py-1 bg-gray-200">
          ◀ Previous
        </button>
        <h2 className="text-lg font-bold">
          Payroll – Week of {days[0].toLocaleString('default', { month: 'short', day: 'numeric' })}
        </h2>
        <button onClick={() => setWeekOffset(weekOffset + 1)} className="px-4 py-1 bg-gray-200">
          Next ▶
        </button>
      </div>

      <div className="flex-grow flex gap-2">
        {days.map((date) => {
          const key = toLocalDateKey(date)
          const mins = hoursByDay[key] || 0
          return (
            <div
              key={key}
              className="flex flex-col flex-[1_0_0%] min-h-[220px] rounded-lg border-4 border-green-600 bg-white px-3 py-4"
            >
              <div className="text-center text-sm font-semibold mb-3 tracking-tight">
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
  )
}
