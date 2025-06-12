'use client'

import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

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
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shiftLog, setShiftLog] = useState<Partial<ShiftLog>>({})
  const [shiftActive, setShiftActive] = useState<boolean>(false)
  const [showCalendar, setShowCalendar] = useState<boolean>(false)
  const [isLogin, setIsLogin] = useState<boolean>(true)

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      if (session) await refreshShiftStatus()
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session) await refreshShiftStatus()
      }
    )

    initSession()

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const refreshShiftStatus = async () => {
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user?.id) return

    const { data: openShift } = await supabase
      .from('Shifts')
      .select('*')
      .eq('User_ID', user.user.id)
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
        onAuthSuccess={(session) => {
          setSession(session)
          refreshShiftStatus()
        }}
      />
    )
  }

  const buttonClass =
    'bg-blue-600 border-2 border-purple-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition'

  return (
    <main className="flex flex-col items-center justify-center px-4 py-8 space-y-6">
      <ShiftControls
        onShiftLogUpdate={setShiftLog}
        onShiftStatusRefresh={refreshShiftStatus}
        shiftActive={shiftActive}
        setError={setError}
      />

      <ShiftStatus shiftLog={shiftLog} shiftActive={shiftActive} />

      <button onClick={() => setShowCalendar(!showCalendar)} className={buttonClass}>
        {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
      </button>

      {showCalendar && (
        <div className="w-full max-w-4xl mt-6">
          <CalendarView />
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm mt-2">
          {error}
        </div>
      )}
    </main>
  )
}
