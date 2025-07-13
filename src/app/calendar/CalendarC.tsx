// File: src/app/calendar/CalendarC.tsx
// Commit: Update CalendarC to insert availability entry into simplified availability table

import { supabase } from '@/lib/supabaseClient'

type CalendarPayload = {
  userId: string
  start_time: Date
  end_time: Date
}

export async function CalendarC(payload: CalendarPayload) {
  const {
    userId,
    start_time,
    end_time,
  } = payload

  console.log('[CalendarC] Payload:', {
    user_id: userId,
    assigned_start: start_time.toISOString(),
    assigned_end: end_time.toISOString(),
  })

  const { error, data } = await supabase.from('availability').insert([
    {
      user_id: userId,
      assigned_start: start_time.toISOString(),
      assigned_end: end_time.toISOString(),
    },
  ])

  if (error) {
    console.error('[CalendarC] Supabase insert error (expanded):', error)
  } else {
    console.log('[CalendarC] Insert success:', data)
  }

  return error
}
