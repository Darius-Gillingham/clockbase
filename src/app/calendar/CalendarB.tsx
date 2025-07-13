// File: app/calendar/CalendarB.tsx
// Commit: restrict modal to availability only, remove type selector and simplify UI

'use client'

import { useState } from 'react'

export default function CalendarB({
  modalDate,
  onClose,
  onSubmit,
}: {
  modalDate: Date
  onClose: () => void
  onSubmit: (params: {
    type: 'availability'
    startTime: string
    endTime: string
    repeats: boolean
  }) => void
}) {
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [repeat, setRepeat] = useState(false)

  const handleSubmit = () => {
    if (!startTime || !endTime) return
    onSubmit({
      type: 'availability',
      startTime,
      endTime,
      repeats: repeat,
    })
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="bg-white dark:bg-gray-900 border border-black dark:border-white rounded-lg shadow-lg p-6 text-black dark:text-white z-10 pointer-events-auto w-[320px]">
        <h3 className="text-lg font-bold mb-4 text-center">{modalDate.toDateString()}</h3>

        <div className="flex flex-col gap-3">
          <label className="text-sm">
            Start Time:
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full mt-1 p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
            />
          </label>
          <label className="text-sm">
            End Time:
            <input
              type="time"
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
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Save
          </button>
          <button
            className="text-red-600 underline text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
