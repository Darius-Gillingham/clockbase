'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ShiftAssigner from '../../shifts/ShiftAssigner'
import { useSessionContext } from '../SessionProvider'

interface Shift {
  shift_start: string
  shift_end: string | null
}

interface AssignedShift {
  assigned_start: string
  assigned_end: string
}

const toLocalDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

const addDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export default function CalendarView() {
  const { session } = useSessionContext()
  const [hoursByDay, setHoursByDay] = useState<Record<string, number>>({})
  const [plannedByDay, setPlannedByDay] = useState<Record<string, string>>({})
  const [weekOffset, setWeekOffset] = useState(0)
  const [showAssigner, setShowAssigner] = useState(false)

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}h ${m}m`
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return

      const userId = session.user.id
      const base = new Date()
      base.setHours(0, 0, 0, 0)
      const current = addDays(base, weekOffset * 7)
      const startOfWeek = addDays(current, -current.getDay())
      const endOfWeek = addDays(startOfWeek, 6)

      const isoStart = startOfWeek.toISOString()
      const isoEnd = new Date(endOfWeek.getTime() + 86399999).toISOString()

      const { data: shifts } = await supabase
        .from('Shifts')
        .select('shift_start, shift_end')
        .eq('User_ID', userId)
        .gte('shift_start', isoStart)
        .lte('shift_start', isoEnd)

      const { data: assigned } = await supabase
        .from('AssignedShifts')
        .select('assigned_start, assigned_end')
        .eq('User_ID', userId)
        .gte('assigned_start', isoStart)
        .lte('assigned_start', isoEnd)

      const map: Record<string, number> = {}
      const planned: Record<string, string> = {}

      for (const shift of shifts || []) {
        if (!shift.shift_end) continue
        const start = new Date(shift.shift_start)
        const end = new Date(shift.shift_end)
        const mins = Math.floor((end.getTime() - start.getTime()) / 60000)
        const key = toLocalDateKey(start)
        map[key] = (map[key] || 0) + mins
      }

      for (const plan of assigned || []) {
        const start = new Date(plan.assigned_start)
        const end = new Date(plan.assigned_end)
        const key = toLocalDateKey(start)
        planned[key] = `${start.toTimeString().slice(0, 5)}-${end.toTimeString().slice(0, 5)}`
      }

      setHoursByDay(map)
      setPlannedByDay(planned)
    }

    fetchData()
  }, [session, weekOffset, showAssigner])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const base = addDays(today, weekOffset * 7)
  const startOfWeek = addDays(base, -base.getDay())

  return (
    <div className="w-full border p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border-black dark:border-white">
      <div className="flex justify-between items-center mb-4 text-black dark:text-white">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400"
        >
          ◀ Previous
        </button>
        <h2 className="text-xl font-bold">
          Week of {startOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </h2>
        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400"
        >
          Next ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-sm sm:text-base">
        {[...Array(7)].map((_, i) => {
          const date = addDays(startOfWeek, i)
          const key = toLocalDateKey(date)
          const mins = hoursByDay[key] || 0
          const plan = plannedByDay[key]

          return (
            <div
              key={key}
              className="border p-2 rounded bg-white dark:bg-gray-800 border-black dark:border-white flex flex-col gap-1"
            >
              <div className="font-bold text-center text-sm">
                {date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
              </div>
              {mins > 0 && (
                <div className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full text-center">
                  {formatDuration(mins)}
                </div>
              )}
              {plan && (
                <div className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full text-center">
                  {plan}
                </div>
              )}
              <button className="text-xs underline text-center mt-1">
                Edit
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => setShowAssigner(!showAssigner)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {showAssigner ? 'Hide Shift Assigner' : 'Assign New Shift'}
        </button>
      </div>

      {showAssigner && <ShiftAssigner onClose={() => setShowAssigner(false)} />}

      <div className="mt-6 text-sm text-center text-gray-600 dark:text-gray-300">
        <em>Optional month view could go here below</em>
      </div>
    </div>
  )
}
