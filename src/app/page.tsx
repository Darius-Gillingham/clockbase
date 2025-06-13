'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSessionContext } from './SessionProvider'

import ShiftControls from './ShiftControls'
import ShiftStatus from './ShiftStatus'
import CalendarView from './CalendarView'
import AuthForm from './AuthForm'

type ShiftLog = {
  start?: string
  end?: string
  range?: string
}

export default function Page() {
  const { session, setSession } = useSessionContext()
  const [error, setError] = useState<string | null>(null)
  const [shiftLog, setShiftLog] = useState<Partial<ShiftLog>>({})
  const [shiftActive, setShiftActive] = useState<boolean>(false)
  const [showCalendar, setShowCalendar] = useState<boolean>(false)
  const [isLogin, setIsLogin] = useState<boolean>(true)

  useEffect(() => {
    if (session) refreshShiftStatus()
  }, [session])

  const refreshShiftStatus = async () => {
    if (!session?.user?.id) return

    const { data: openShift } = await supabase
      .from('Shifts')
      .select('*')
      .eq('User_ID', session.user.id)
      .eq('shift_active', true)
      .order('shift_start', { ascending: false })
      .limit(1)
      .single()

    setShiftActive(!!openShift)
  }

  if (!session) {
    return (
      <AuthForm
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        setError={setError}
        onAuthSuccess={(newSession) => {
          setSession(newSession)
          refreshShiftStatus()
        }}
      />
    )
  }

  const buttonClass =
    'w-full max-w-xs bg-blue-600 border-2 border-purple-600 text-white py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition'

  return (
    <main className="flex flex-col items-center justify-center px-4 py-8 space-y-6 bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <ShiftControls
        onShiftLogUpdate={setShiftLog}
        onShiftStatusRefresh={refreshShiftStatus}
        shiftActive={shiftActive}
        setError={setError}
      />

      <ShiftStatus shiftLog={shiftLog} shiftActive={shiftActive} />

      <button
        onClick={() => setShowCalendar(!showCalendar)}
        className={buttonClass}
      >
        {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
      </button>

      {showCalendar && (
        <div className="w-full max-w-4xl mt-6">
          <CalendarView />
        </div>
      )}

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm mt-2">
          {error}
        </div>
      )}
    </main>
  )
}
