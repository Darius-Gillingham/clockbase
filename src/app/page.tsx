// File: app/page.tsx
// Commit: add page layout panels and navigation to calendar route

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useSessionContext } from './SessionProvider'

import ShiftControls from './ShiftControls'
import ShiftStatus from './ShiftStatus'
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
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <nav className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b border-black dark:border-white">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-semibold">Clockbase</h1>
          <Link
            href="/calendar"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            View Calendar
          </Link>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center px-4 py-8 space-y-6">
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
    </div>
  )
}
