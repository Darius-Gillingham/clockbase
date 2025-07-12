// File: app/calendar/page.tsx
// Commit: centralize shared state and logic into page, mount all calendar components here

'use client'

import { useState } from 'react'
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
    type: 'availability' | 'scheduled_shift' | 'event'
    startTime: string
    endTime: string
    repeats: boolean
  }) => {
    if (!modalDate || !session?.user?.id) return

    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    const start = new Date(modalDate)
    start.setHours(startHour, startMinute, 0, 0)

    const end = new Date(modalDate)
    end.setHours(endHour, endMinute, 0, 0)

    const error = await CalendarC({
      userId: session.user.id,
      type,
      start_time: start,
      end_time: end,
      repeats,
      repeat_interval: repeats ? 'weekly' : null,
    })

    if (error) {
      console.error('Error saving calendar item:', error)
    } else {
      handleModalClose()
    }
  }

  return (
    <>
      <CalendarA
        weekOffset={weekOffset}
        setWeekOffset={setWeekOffset}
        onDateClick={handleDateClick}
      />

      {modalDate && (
        <CalendarB
          modalDate={modalDate}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}

      <CalendarD
        onPrev={() => setWeekOffset(weekOffset - 1)}
        onNext={() => setWeekOffset(weekOffset + 1)}
        label={`Week ${weekOffset + 1}`}
      />
    </>
  )
}
