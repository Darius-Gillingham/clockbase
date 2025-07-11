// File: src/app/page.tsx
// Commit: fix panel imports using relative path to local app/panel directory

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSessionContext } from './SessionProvider'

import ShiftControls from './panel/ShiftControls'
import ShiftStatus from './panel/ShiftStatus'
import AuthForm from '@/auth/AuthForm'

type ShiftLog = {
  start?: string
  end?: string
  range?: string
}

export default function HomePage() {
  const { session, setSession } = useSessionContext()
  const [error, setError] = useState<string | null>(null)
  const [shiftLog, setShiftLog] = useState<Partial<ShiftLog>>({})
  const [shiftActive, setShiftActive] = useState<boolean>(false)
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

  return (
    <main className="flex flex-col items-center justify-center px-4 py-8 space-y-6 bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-2">Welcome to Clockbase</h1>

      <ShiftControls
        onShiftLogUpdate={setShiftLog}
        onShiftStatusRefresh={refreshShiftStatus}
        shiftActive={shiftActive}
        setError={setError}
      />

      <ShiftStatus shiftLog={shiftLog} shiftActive={shiftActive} />

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm mt-2">
          {error}
        </div>
      )}
    </main>
  )
}
