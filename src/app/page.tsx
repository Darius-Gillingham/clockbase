// File: src/app/page.tsx
// Commit: Move stateful profile drawer logic from layout to client-only homepage to resolve build error

'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useSessionContext } from './SessionProvider'

import ShiftControls from './panel/ShiftControls'
import ShiftStatus from './panel/ShiftStatus'
import PayrollCalendar from './payroll/PayrollCalendar'
import AuthForm from '@/app/auth/AuthForm'

type ShiftLog = {
  start?: string
  end?: string
  range?: string
}

export default function HomePage() {
  const { session, setSession } = useSessionContext()
  const pathname = usePathname()
  const [error, setError] = useState<string | null>(null)
  const [shiftLog, setShiftLog] = useState<Partial<ShiftLog>>({})
  const [shiftActive, setShiftActive] = useState<boolean>(false)
  const [isLogin, setIsLogin] = useState<boolean>(true)
  const [showProfilePanel, setShowProfilePanel] = useState(false)

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

  if (pathname === '/payroll') {
    return (
      <main className="relative flex flex-col items-center justify-center px-4 py-8 bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
        <PayrollCalendar />

        <div className="absolute bottom-[5vh] right-[4vw] z-50">
          <button
            onClick={() => setShowProfilePanel(true)}
            className="p-2 rounded-full border-2 border-white bg-white dark:bg-black hover:scale-105 transition-transform"
          >
            <img
              src="/assets/profile-icon.png"
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          </button>
        </div>

        <div
          className={`fixed top-0 right-0 h-full w-80 max-w-full bg-white dark:bg-neutral-900 border-l border-black dark:border-white shadow-xl z-50 transform transition-transform duration-300 ${
            showProfilePanel ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-black dark:border-white">
            <h2 className="text-lg font-bold">Profile</h2>
            <button
              onClick={() => setShowProfilePanel(false)}
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:underline"
            >
              Close
            </button>
          </div>
          <div className="p-4 space-y-4 text-sm">
            <p>Coming soon: account settings, preferences, and more.</p>
          </div>
        </div>
      </main>
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
