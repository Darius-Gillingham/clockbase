'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

type ShiftLog = {
  start: string
  end: string
  range: string
}

interface ShiftControlsProps {
  onShiftLogUpdate: (log: Partial<ShiftLog>) => void
  onShiftStatusRefresh: () => void
  shiftActive: boolean
  setError: (err: string | null) => void
}

export default function ShiftControls({
  onShiftLogUpdate,
  onShiftStatusRefresh,
  shiftActive,
  setError
}: ShiftControlsProps) {
  const [clock, setClock] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setClock(now.toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const buttonClass =
    'w-full bg-blue-600 border-2 border-purple-600 text-white py-2 rounded hover:bg-blue-700 transition'

  const handleStartShift = async () => {
    console.log('Start Shift button clicked')
    setLoading(true)
    setError(null)

    const { data: userResult, error: userError } = await supabase.auth.getUser()
    if (userError || !userResult?.user?.id) {
      console.error('Failed to get authenticated user:', userError)
      setError('Authentication error.')
      setLoading(false)
      return
    }

    const userId = userResult.user.id
    const now = new Date().toISOString()

    const { error: insertError } = await supabase.from('Shifts').insert([
      {
        User_ID: userId,
        shift_start: now,
        shift_active: true,
        sent: false,
      },
    ])

    if (insertError) {
      console.error('Insert error:', insertError)
      setError(insertError.message)
    } else {
      onShiftLogUpdate({ start: now })
    }

    await onShiftStatusRefresh()
    setLoading(false)
  }

  const handleEndShift = async () => {
    console.log('End Shift button clicked')
    setLoading(true)
    setError(null)

    const { data: userResult, error: userError } = await supabase.auth.getUser()
    if (userError || !userResult?.user?.id) {
      console.error('Failed to get authenticated user:', userError)
      setError('Authentication error.')
      setLoading(false)
      return
    }

    const userId = userResult.user.id

    const { data: openShift, error: fetchError } = await supabase
      .from('Shifts')
      .select('*')
      .eq('User_ID', userId)
      .eq('shift_active', true)
      .order('shift_start', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !openShift) {
      console.error('Fetch error:', fetchError)
      setError('No active shift to end.')
      setLoading(false)
      return
    }

    const endTime = new Date()
    const shiftStart = new Date(openShift.shift_start)
    const range = `${shiftStart.toTimeString().slice(0, 5)}-${endTime.toTimeString().slice(0, 5)}`
    const shiftDate = shiftStart.toISOString().split('T')[0]
    const filename = `${userId}-${shiftDate}.json`

    const { error: updateError } = await supabase
      .from('Shifts')
      .update({
        shift_end: endTime.toISOString(),
        shift_active: false,
        notes: range,
      })
      .eq('id', openShift.id)

    onShiftLogUpdate({ start: openShift.shift_start, end: endTime.toISOString() })

    const updatedJSON: ShiftLog[] = []

    const { data: fileExists } = await supabase.storage
      .from('shift-json')
      .list('', { search: filename })

    if (fileExists?.length) {
      const { data: existingFile } = await supabase.storage
        .from('shift-json')
        .download(filename)

      const text = await existingFile?.text()
      if (text) {
        try {
          const existing: ShiftLog[] = JSON.parse(text)
          updatedJSON.push(...existing)
        } catch {
          setError('Failed to parse existing JSON.')
        }
      }
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

    await onShiftStatusRefresh()
    setLoading(false)
  }

  return (
    <>
      <div className="text-xl font-mono text-gray-700">{clock}</div>
      <div className="flex flex-col w-full max-w-xs gap-4">
        <button onClick={handleStartShift} disabled={loading} className={buttonClass}>
          Start Shift
        </button>
        <button onClick={handleEndShift} disabled={loading} className={buttonClass}>
          End Shift
        </button>
      </div>
    </>
  )
}
