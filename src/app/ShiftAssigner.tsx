'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSessionContext } from './SessionProvider'

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function ShiftAssigner({ onClose }: { onClose: () => void }) {
  const { session, setSession } = useSessionContext()
  const [day, setDay] = useState('Monday')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleAssign = async () => {
    if (!session?.user?.id) {
      setMessage('User not authenticated.')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const now = new Date()
      const todayIndex = now.getDay()
      const targetIndex = daysOfWeek.indexOf(day)

      const diff = (targetIndex - todayIndex + 7) % 7
      const targetDate = new Date(now)
      targetDate.setDate(now.getDate() + diff)

      const [startHour, startMin] = startTime.split(':').map(Number)
      const [endHour, endMin] = endTime.split(':').map(Number)

      const assignedStart = new Date(targetDate)
      assignedStart.setHours(startHour, startMin, 0, 0)

      const assignedEnd = new Date(targetDate)
      assignedEnd.setHours(endHour, endMin, 0, 0)

      const { error: insertError } = await supabase.from('AssignedShifts').insert([
        {
          User_ID: session.user.id,
          assigned_start: assignedStart.toISOString(),
          assigned_end: assignedEnd.toISOString(),
        }
      ])

      if (insertError) {
        setMessage(`Insert error: ${insertError.message}`)
      } else {
        const { data: freshSession, error: sessionError } = await supabase.auth.getSession()
        if (!sessionError && freshSession?.session) {
          setSession(freshSession.session)
          setMessage('Shift scheduled successfully.')
        } else {
          setMessage('Shift saved, but session could not be reverified.')
        }
      }
    } catch (e) {
      setMessage('Unexpected error during shift assignment.')
      console.error(e)
    }

    setLoading(false)
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border rounded shadow w-full max-w-md mx-auto mt-4">
      <h2 className="text-lg font-semibold mb-4 text-center text-black dark:text-white">
        Schedule a Shift
      </h2>

      <div className="flex flex-col gap-4">
        <label className="text-black dark:text-white">
          Day of Week:
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full border px-2 py-1 rounded mt-1"
          >
            {daysOfWeek.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>

        <label className="text-black dark:text-white">
          Start Time:
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border px-2 py-1 rounded mt-1"
          />
        </label>

        <label className="text-black dark:text-white">
          End Time:
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border px-2 py-1 rounded mt-1"
          />
        </label>

        <button
          onClick={handleAssign}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Scheduling...' : 'Schedule Shift'}
        </button>

        {message && (
          <p className="text-center text-sm mt-2 text-black dark:text-white">
            {message}
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full bg-gray-300 text-black py-2 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  )
}
