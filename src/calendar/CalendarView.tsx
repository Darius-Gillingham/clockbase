'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ShiftAssigner from '../shifts/ShiftAssigner'
import { useSessionContext } from '../app/SessionProvider'

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

export default function CalendarView() {
  const { session } = useSessionContext()
  const [hoursByDay, setHoursByDay] = useState<Record<string, number>>({})
  const [plannedByDay, setPlannedByDay] = useState<Record<string, string>>({})
  const [monthTotal, setMonthTotal] = useState(0)
  const [payPeriodTotal, setPayPeriodTotal] = useState(0)
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

      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      const monthStart = firstDay.toISOString()
      const monthEnd = new Date(
        lastDay.getFullYear(),
        lastDay.getMonth(),
        lastDay.getDate(),
        23, 59, 59
      ).toISOString()

      const reference = new Date("2025-01-03T00:00:00Z")
      const daysSince = Math.floor((now.getTime() - reference.getTime()) / 86400000)
      const payPeriodIndex = Math.floor(daysSince / 14)
      const periodStart = new Date(reference.getTime() + payPeriodIndex * 14 * 86400000)
      const periodEnd = new Date(periodStart.getTime() + 13 * 86400000)

      const { data: shifts, error: shiftsError } = await supabase
        .from('Shifts')
        .select('shift_start, shift_end')
        .eq('User_ID', userId)
        .gte('shift_start', monthStart)
        .lte('shift_start', monthEnd)

      const { data: assigned, error: assignedError } = await supabase
        .from('AssignedShifts')
        .select('assigned_start, assigned_end')
        .eq('User_ID', userId)
        .gte('assigned_start', monthStart)
        .lte('assigned_start', monthEnd)

      if (shiftsError) console.error('Failed to fetch shifts:', shiftsError)
      if (assignedError) console.error('Failed to fetch assigned shifts:', assignedError)

      const map: Record<string, number> = {}
      const planned: Record<string, string> = {}
      let monthMinutes = 0
      let payPeriodMinutes = 0

      for (const shift of shifts || []) {
        if (!shift.shift_end) continue
        const start = new Date(shift.shift_start)
        const end = new Date(shift.shift_end)
        const mins = Math.floor((end.getTime() - start.getTime()) / 60000)
        const key = toLocalDateKey(start)
        map[key] = (map[key] || 0) + mins
        monthMinutes += mins
        if (start >= periodStart && start <= periodEnd) {
          payPeriodMinutes += mins
        }
      }

      for (const plan of assigned || []) {
        const start = new Date(plan.assigned_start)
        const end = new Date(plan.assigned_end)
        const key = toLocalDateKey(start)
        planned[key] = `${start.toTimeString().slice(0, 5)}-${end.toTimeString().slice(0, 5)}`
      }

      setHoursByDay(map)
      setPlannedByDay(planned)
      setMonthTotal(monthMinutes)
      setPayPeriodTotal(payPeriodMinutes)
    }

    fetchData()
  }, [session, showAssigner])

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDay = firstDay.getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const cells: React.ReactElement[] = []

  for (let i = 0; i < startDay; i++) {
    cells.push(
      <div
        key={`empty-${i}`}
        className="border h-24 bg-white dark:bg-gray-900 border-black dark:border-white"
      ></div>
    )
  }

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day)
    const dateStr = toLocalDateKey(date)
    const mins = hoursByDay[dateStr] || 0
    const plan = plannedByDay[dateStr]

    cells.push(
      <div
        key={dateStr}
        className="border h-24 p-1 text-center flex flex-col justify-between 
                   border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white"
      >
        <div className="font-bold text-sm">{day}</div>
        <div className="flex flex-col items-center justify-center gap-1 text-xs">
          {mins > 0 && (
            <div className="rounded-full bg-blue-200 text-blue-800 px-2 py-1 w-fit">
              {formatDuration(mins)}
            </div>
          )}
          {plan && (
            <div className="rounded-full bg-green-200 text-green-800 px-2 py-1 w-fit">
              {plan}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full border-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border-black dark:border-white">
      <div className="text-2xl font-bold mb-4 text-center text-black dark:text-white">
        {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </div>

      <div className="mb-6 text-center text-black dark:text-white">
        <p className="text-lg font-medium">
          Total Hours This Month: <span className="font-bold">{formatDuration(monthTotal)}</span>
        </p>
        <p className="text-lg font-medium">
          Total Hours This Pay Period: <span className="font-bold">{formatDuration(payPeriodTotal)}</span>
        </p>
      </div>

      <div className="mb-4 text-center">
        <button
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
          onClick={() => setShowAssigner(!showAssigner)}
        >
          {showAssigner ? 'Hide Shift Assigner' : 'Assign New Shift'}
        </button>
      </div>

      {showAssigner && <ShiftAssigner onClose={() => setShowAssigner(false)} />}

      <div className="grid grid-cols-7 border border-black dark:border-white text-black dark:text-white text-sm sm:text-base">
        <div className="border p-2 font-bold text-center border-black dark:border-white">Sun</div>
        <div className="border p-2 font-bold text-center border-black dark:border-white">Mon</div>
        <div className="border p-2 font-bold text-center border-black dark:border-white">Tue</div>
        <div className="border p-2 font-bold text-center border-black dark:border-white">Wed</div>
        <div className="border p-2 font-bold text-center border-black dark:border-white">Thu</div>
        <div className="border p-2 font-bold text-center border-black dark:border-white">Fri</div>
        <div className="border p-2 font-bold text-center border-black dark:border-white">Sat</div>
        {cells}
      </div>
    </div>
  )
}
