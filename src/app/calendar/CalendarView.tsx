// File: app/calendar/CalendarView.tsx
// Commit: support saving availability, scheduled shifts, and events with dual input modes and visual calendar rendering

'use client'

import { useEffect, useState } from 'react'
import { useSessionContext } from '../SessionProvider'
import { saveCalendarItem } from './saveCalendarItem'
import { supabase } from '@/lib/supabaseClient'

type CalendarItemType = 'availability' | 'scheduled_shift' | 'event'

interface CalendarItem {
  id: string
  type: CalendarItemType
  start_time: string
  end_time: string
  title?: string
  notes?: string
  repeats?: boolean
  repeat_interval?: 'weekly' | null
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

export default function CalendarView() {
  const { session } = useSessionContext()
  const [weekOffset, setWeekOffset] = useState(0)
  const [modalDate, setModalDate] = useState<Date | null>(null)
  const [selectedAction, setSelectedAction] = useState<CalendarItemType | null>(null)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [repeat, setRepeat] = useState(false)
  const [useCalendarInput, setUseCalendarInput] = useState(false)
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([])

  const days = getWeekDays(weekOffset)

  const resetModal = () => {
    setModalDate(null)
    setSelectedAction(null)
    setStartTime('')
    setEndTime('')
    setRepeat(false)
    setUseCalendarInput(false)
  }

  const fetchItems = async () => {
    if (!session?.user?.id) return

    const week = getWeekDays(weekOffset)
    const start = new Date(week[0])
    const end = new Date(week[6])
    end.setHours(23, 59, 59)

    const { data } = await supabase
      .from('CalendarItems')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('start_time', start.toISOString())
      .lte('start_time', end.toISOString())

    if (data) {
      setCalendarItems(data.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()))
    }
  }

  useEffect(() => {
    fetchItems()
  }, [session, weekOffset])

  const handleSubmit = async () => {
    if (!session?.user?.id || !modalDate || !startTime || !endTime || !selectedAction) return

    const start = new Date(useCalendarInput ? startTime : `${modalDate.toISOString().split('T')[0]}T${startTime}`)
    const end = new Date(useCalendarInput ? endTime : `${modalDate.toISOString().split('T')[0]}T${endTime}`)

    await saveCalendarItem({
      userId: session.user.id,
      type: selectedAction,
      start_time: start,
      end_time: end,
      repeats: repeat,
      repeat_interval: repeat ? 'weekly' : null,
    })

    resetModal()
    fetchItems()
  }

  const colorByType: Record<CalendarItemType, string> = {
    availability: 'bg-yellow-300 text-yellow-900',
    scheduled_shift: 'bg-green-300 text-green-900',
    event: 'bg-purple-300 text-purple-900',
  }

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
            const items = calendarItems.filter(
              (item) => toLocalDateKey(new Date(item.start_time)) === key
            )

            return (
              <div
                key={key}
                onClick={() => setModalDate(date)}
                className="flex-1 flex flex-col border-r border-black dark:border-white px-2 py-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <div className="font-bold text-center text-sm mb-2">
                  {date.getDate()} {date.toLocaleString('default', { weekday: 'short' })}
                </div>
                <div className="flex flex-col gap-2 text-xs">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`${colorByType[item.type]} px-2 py-1 rounded`}
                    >
                      {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                      {new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {item.title ? ` • ${item.title}` : ''}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {modalDate && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-gray-900 border border-black dark:border-white rounded-lg shadow-lg p-6 text-black dark:text-white z-10 pointer-events-auto w-[340px]">
            <h3 className="text-lg font-bold mb-4 text-center">
              {modalDate.toDateString()}
            </h3>

            {selectedAction ? (
              <div className="flex flex-col gap-3">
                <label className="text-sm flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useCalendarInput}
                    onChange={(e) => setUseCalendarInput(e.target.checked)}
                  />
                  Use calendar input
                </label>
                <label className="text-sm">
                  Start Time:
                  <input
                    type={useCalendarInput ? 'datetime-local' : 'time'}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full mt-1 p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                  />
                </label>
                <label className="text-sm">
                  End Time:
                  <input
                    type={useCalendarInput ? 'datetime-local' : 'time'}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full mt-1 p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                  />
                </label>
                <label className="text-sm flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={repeat}
                    onChange={(e) => setRepeat(e.target.checked)}
                  />
                  Repeat weekly
                </label>
                <button
                  className={`py-2 px-6 rounded hover:brightness-110 ${
                    selectedAction === 'availability'
                      ? 'bg-yellow-600 text-white'
                      : selectedAction === 'scheduled_shift'
                      ? 'bg-green-600 text-white'
                      : 'bg-purple-600 text-white'
                  }`}
                  onClick={handleSubmit}
                >
                  Save {selectedAction}
                </button>
                <button
                  className="text-red-600 underline text-sm"
                  onClick={resetModal}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  className="bg-yellow-600 text-white py-2 px-6 rounded hover:bg-yellow-700"
                  onClick={() => setSelectedAction('availability')}
                >
                  Set Availability
                </button>
                <button
                  className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700"
                  onClick={() => setSelectedAction('scheduled_shift')}
                >
                  Assign Shift
                </button>
                <button
                  className="bg-purple-600 text-white py-2 px-6 rounded hover:bg-purple-700"
                  onClick={() => setSelectedAction('event')}
                >
                  Create Event
                </button>
                <button
                  className="text-red-600 underline mt-2 text-sm"
                  onClick={resetModal}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
