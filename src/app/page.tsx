'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Page() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [clock, setClock] = useState<string>('')

  const [shiftLog, setShiftLog] = useState<{ start?: string; end?: string }>({})
  const [shiftActive, setShiftActive] = useState<boolean>(false)

  const [showCalendar, setShowCalendar] = useState<boolean>(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setClock(now.toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const refreshShiftStatus = async () => {
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user) return

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

  useEffect(() => {
    if (session) refreshShiftStatus()
  }, [session])

  const handleAuth = async () => {
    setError(null)
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    const { error: authError } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (authError) setError(authError.message)
  }

  const handleStartShift = async () => {
    setLoading(true)
    setError(null)

    const { data: user } = await supabase.auth.getUser()
    if (!user?.user?.id) {
      setError('User not fully authenticated.')
      setLoading(false)
      return
    }

    const now = new Date().toISOString()

    const { error } = await supabase.from('Shifts').insert([{
      User_ID: user.user.id,
      shift_start: now,
      shift_active: true,
      sent: false,
    }])

    if (error) {
      console.error('Insert error:', error)
      setError(error.message)
    } else {
      setShiftLog((prev) => ({ ...prev, start: now }))
    }

    await refreshShiftStatus()
    setLoading(false)
  }

  const handleEndShift = async () => {
    setLoading(true)
    setError(null)

    const { data: user } = await supabase.auth.getUser()
    if (!user?.user?.id) {
      setError('User not logged in.')
      setLoading(false)
      return
    }

    const { data: openShift, error: fetchError } = await supabase
      .from('Shifts')
      .select('*')
      .eq('User_ID', user.user.id)
      .eq('shift_active', true)
      .order('shift_start', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !openShift) {
      setError('No active shift to end.')
      setLoading(false)
      return
    }

    const endTime = new Date()
    const shiftStart = new Date(openShift.shift_start)
    const range = `${shiftStart.toTimeString().slice(0, 5)}-${endTime.toTimeString().slice(0, 5)}`
    const shiftDate = shiftStart.toISOString().split('T')[0]
    const filename = `${user.user.id}-${shiftDate}.json`

    const { error: updateError } = await supabase
      .from('Shifts')
      .update({
        shift_end: endTime.toISOString(),
        shift_active: false,
        notes: range,
      })
      .eq('id', openShift.id)

    setShiftLog({ start: openShift.shift_start, end: endTime.toISOString() })

    const { data: fileExists } = await supabase.storage
      .from('shift-json')
      .list('', { search: filename })

    let updatedJSON: any[] = []

    if (fileExists?.length) {
      const { data: existingFile } = await supabase.storage
        .from('shift-json')
        .download(filename)
      const text = await existingFile?.text()
      if (text) updatedJSON = JSON.parse(text)
    }

    updatedJSON.push({
      start: shiftStart.toISOString(),
      end: endTime.toISOString(),
      range,
    })

    await supabase.storage
      .from('shift-json')
      .upload(filename, new Blob([JSON.stringify(updatedJSON)], { type: 'application/json' }), {
        upsert: true,
      })

    await refreshShiftStatus()
    setLoading(false)
  }

  const buttonClass =
    'w-full bg-blue-600 border-2 border-purple-600 text-white py-2 rounded hover:bg-blue-700 transition'

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">
          {isLogin ? 'Log In' : 'Sign Up'}
        </h1>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <button
            onClick={(e) => {
              e.preventDefault()
              handleAuth()
            }}
            className={buttonClass}
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
          <p className="text-sm text-center">
            {isLogin ? 'No account?' : 'Already have an account?'}{' '}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center gap-6">
      <h1 className="text-2xl font-semibold text-center">Dashboard</h1>
      <div className="text-xl font-mono text-gray-700">{clock}</div>
      <div className="flex flex-col w-full max-w-xs gap-4">
        <button onClick={handleStartShift} disabled={!session} className={buttonClass}>
          Start Shift
        </button>
        <button onClick={handleEndShift} className={buttonClass}>
          End Shift
        </button>
        <button onClick={() => setShowCalendar(!showCalendar)} className={buttonClass}>
          {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
        </button>
      </div>

      {showCalendar && (
        <div className="mt-4 text-gray-700 text-sm">
          <p>Calendar view will go here.</p>
          {/* This block is real and toggleable. You can place a future calendar component here. */}
        </div>
      )}

      {(shiftLog.start || shiftLog.end) && (
        <div className="text-sm text-gray-600 mt-4">
          {shiftLog.start && <p>Start: {new Date(shiftLog.start).toLocaleString()}</p>}
          {shiftLog.end && <p>End: {new Date(shiftLog.end).toLocaleString()}</p>}
        </div>
      )}

      <div className="text-sm mt-2 text-gray-700">
        Shift is currently:{' '}
        <span className={shiftActive ? 'text-green-600' : 'text-red-600'}>
          {shiftActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </div>

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  )
}
