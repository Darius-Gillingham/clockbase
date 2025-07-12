// File: app/calendar/CalendarB.tsx
// Commit: modal input form for setting availability, shift, or event

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
    type: 'availability' | 'scheduled_shift' | 'event'
    startTime: string
    endTime: string
    repeats: boolean
  }) => void
}) {
  const [selectedType, setSelectedType] = useState<'availability' | 'scheduled_shift' | 'event' | null>(null)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [repeat, setRepeat] = useState(false)

  const handleSubmit = () => {
    if (!startTime || !endTime || !selectedType) return
    onSubmit({
      type: selectedType,
      startTime,
      endTime,
      repeats: repeat,
    })
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="bg-white dark:bg-gray-900 border border-black dark:border-white rounded-lg shadow-lg p-6 text-black dark:text-white z-10 pointer-events-auto w-[320px]">
        <h3 className="text-lg font-bold mb-4 text-center">{modalDate.toDateString()}</h3>

        {selectedType ? (
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
              <input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} />
              Repeat weekly
            </label>
            <button
              className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Save
            </button>
            <button className="text-red-600 underline text-sm" onClick={onClose}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              className="bg-yellow-600 text-white py-2 px-6 rounded hover:bg-yellow-700"
              onClick={() => setSelectedType('availability')}
            >
              Set Availability
            </button>
            <button
              className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700"
              onClick={() => setSelectedType('scheduled_shift')}
            >
              Assign Shift
            </button>
            <button
              className="bg-purple-600 text-white py-2 px-6 rounded hover:bg-purple-700"
              onClick={() => setSelectedType('event')}
            >
              Create Event
            </button>
            <button className="text-red-600 underline mt-2 text-sm" onClick={onClose}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
