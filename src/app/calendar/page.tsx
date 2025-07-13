'use client'

import { useEffect, useState } from 'react'
import { useSessionContext } from '../SessionProvider'
import CalendarA from './CalendarA'
import CalendarB from './CalendarB'
import { CalendarC } from './CalendarC'
import CalendarD from './CalendarD'

export default function CalendarPage() {
  const { session } = useSessionContext()

  const [weekOffset, setWeekOffset] = useState(0)
  const [modalDate, setModalDate] = useState<Date | null>(null)

  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [repeat, setRepeat] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return
    const now = new Date()
    const inTenMin = new Date(now.getTime() + 10 * 60 * 1000)

    CalendarC({
      userId: session.user.id,
      type: 'availability',
      start_time: now,
      end_time: inTenMin,
      title: '[TEST] Init Check',
      notes: '[TEST]',
      repeats: false,
      repeat_interval: null,
    }).then((error) => {
      if (error) {
        console.error('[CalendarPage] Initial test insert failed:', error)
      } else {
        console.log('[CalendarPage] Initial test insert passed')
      }
    })
  }, [session?.user?.id])

  const handleDateClick = (date: Date) => {
    setModalDate(date)
  }

  const handleModalClose = () => {
    setModalDate(null)
    setStartTime('')
    setEndTime('')
    setRepeat(false)
  }

  const handleModalSubmit = async ({
    type,
    startTime,
    endTime,
    repeats,
  }: {
    type: 'availability'
    startTime: string
    endTime: string
    repeats: boolean
  }) => {
    if (!modalDate || !session?.user?.id) {
      console.warn('[CalendarPage] Submission blocked: missing modalDate or session')
      return
    }

    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    const start = new Date(modalDate)
    start.setHours(startHour, startMinute, 0, 0)

    const end = new Date(modalDate)
    end.setHours(endHour, endMinute, 0, 0)

    if (end <= start) {
      alert('End time must be after start time.')
      return
    }

    console.log('[CalendarPage] Submitting calendar item:', {
      userId: session.user.id,
      type,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      repeats,
      repeat_interval: repeats ? 'weekly' : null,
    })

    const error = await CalendarC({
      userId: session.user.id,
      type,
      start_time: start,
      end_time: end,
      repeats,
      repeat_interval: repeats ? 'weekly' : null,
    })

    if (error) {
      console.error('[CalendarPage] Save failed:', JSON.stringify(error, null, 2))
      alert('Failed to save availability.')
    } else {
      handleModalClose()
    }
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

  const days = getWeekDays(weekOffset)
  const label = days[0].toLocaleString('default', { month: 'short', day: 'numeric' })

  return (
    <div className="flex flex-col h-[calc(100vh-60px)]">
      <CalendarD
        weekOffset={weekOffset}
        setWeekOffset={setWeekOffset}
      />

      <CalendarA
        weekOffset={weekOffset}
        onDateClick={handleDateClick}
      />

      {modalDate && (
        <CalendarB
          modalDate={modalDate}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  )
}
