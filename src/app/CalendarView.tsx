'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Shift {
  shift_start: string
  shift_end: string | null
}

export default function CalendarView() {
  const [hoursByDay, setHoursByDay] = useState<Record<string, number>>({})
  const [monthTotal, setMonthTotal] = useState(0)
  const [payPeriodTotal, setPayPeriodTotal] = useState(0)

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}h ${m}m`
  }

  useEffect(() => {
    const fetchData = async () => {
      const { data: userResult, error: userError } = await supabase.auth.getUser()
      if (userError || !userResult?.user?.id) {
        console.error('Authentication failed or user missing:', userError)
        return
      }

      const userId = userResult.user.id

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

      const { data: shifts, error } = await supabase
        .from('Shifts')
        .select('shift_start, shift_end')
        .eq('User_ID', userId)
        .gte('shift_start', monthStart)
        .lte('shift_start', monthEnd)

      if (error) {
        console.error('Failed to fetch shifts:', error)
        return
      }

      const map: Record<string, number> = {}
      let monthMinutes = 0
      let payPeriodMinutes = 0

      for (const shift of shifts || []) {
        if (!shift.shift_end) continue
        const start = new Date(shift.shift_start)
        const end = new Date(shift.shift_end)
        const mins = Math.floor((end.getTime() - start.getTime()) / 60000)
        const key = start.toISOString().split('T')[0]
        map[key] = (map[key] || 0) + mins
        monthMinutes += mins
        if (start >= periodStart && start <= periodEnd) {
          payPeriodMinutes += mins
        }
      }

      setHoursByDay(map)
      setMonthTotal(monthMinutes)
      setPayPeriodTotal(payPeriodMinutes)
    }

    fetchData()
  }, [])

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDay = firstDay.getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const cells: React.ReactElement[] = []

  for (let i = 0; i < startDay; i++) {
    cells.push(<div key={`empty-${i}`} className="border border-black h-24 bg-white"></div>)
  }

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0]
    const mins = hoursByDay[dateStr] || 0
    cells.push(
      <div
        key={dateStr}
        className="border border-black h-24 p-2 text-center flex flex-col justify-between bg-white"
      >
        <div className="font-bold text-lg">{day}</div>
        <div className="text-blue-700 text-base font-semibold">{formatDuration(mins)}</div>
      </div>
    )
  }

  return (
    <div className="w-full border-2 border-black p-4 rounded-lg bg-gray-50">
      <div className="text-2xl font-bold mb-4 text-center">
        {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </div>

      <div className="mb-6 text-center">
        <p className="text-lg font-medium">
          Total Hours This Month: <span className="font-bold">{formatDuration(monthTotal)}</span>
        </p>
        <p className="text-lg font-medium">
          Total Hours This Pay Period: <span className="font-bold">{formatDuration(payPeriodTotal)}</span>
        </p>
      </div>

      <div className="grid grid-cols-7 border border-black">
        <div className="border border-black p-2 font-bold text-center">Sun</div>
        <div className="border border-black p-2 font-bold text-center">Mon</div>
        <div className="border border-black p-2 font-bold text-center">Tue</div>
        <div className="border border-black p-2 font-bold text-center">Wed</div>
        <div className="border border-black p-2 font-bold text-center">Thu</div>
        <div className="border border-black p-2 font-bold text-center">Fri</div>
        <div className="border border-black p-2 font-bold text-center">Sat</div>
        {cells}
      </div>
    </div>
  )
}
