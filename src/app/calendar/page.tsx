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

  useEffect(() => {
    if (!session?.user?.id) return
    const now = new Date()
    const inTenMin = new Date(now.getTime() + 10 * 60 * 1000)

    CalendarC({
      userId: session.user.id,
      start_time: now,
      end_time: inTenMin,
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
  }

  const handleModalSubmit = async ({
    startTime,
    endTime,
  }: {
    startTime: string
    endTime: string
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

    console.log('[CalendarPage] Submitting availability:', {
      userId: session.user.id,
      assigned_start: start.toISOString(),
      assigned_end: end.toISOString(),
    })

    const error = await CalendarC({
      userId: session.user.id,
      start_time: start,
      end_time: end,
    })

    if (error) {
      console.group('[CalendarPage] Save failed')
      console.error('Code:', error.code)
      console.error('Message:', error.message)
      console.error('Details:', error.details)
      console.groupEnd()
      alert('Failed to save availability. Check console for details.')
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
