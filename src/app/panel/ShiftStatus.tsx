'use client'

interface ShiftStatusProps {
  shiftLog: {
    start?: string
    end?: string
  }
  shiftActive: boolean
}

export default function ShiftStatus({ shiftLog, shiftActive }: ShiftStatusProps) {
  const renderTimestamp = (label: string, value?: string) => {
    if (!value) return null
    return (
      <p>
        {label}: {new Date(value).toLocaleString()}
      </p>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      {(shiftLog.start || shiftLog.end) && (
        <div className="text-sm text-gray-600">
          {renderTimestamp('Start', shiftLog.start)}
          {renderTimestamp('End', shiftLog.end)}
        </div>
      )}
      <div className="text-sm text-gray-700">
        Shift is currently:{' '}
        <span className={shiftActive ? 'text-green-600' : 'text-red-600'}>
          {shiftActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </div>
    </div>
  )
}
