import { supabase } from '@/lib/supabaseClient'

type CalendarPayload = {
  userId: string
  type: 'availability' | 'scheduled_shift' | 'event'
  start_time: Date
  end_time: Date
  title?: string
  notes?: string
  repeats?: boolean
  repeat_interval?: 'weekly' | null
}

export async function CalendarC(payload: CalendarPayload) {
  const {
    userId,
    type,
    start_time,
    end_time,
    title = null,
    notes = null,
    repeats = false,
    repeat_interval = null,
  } = payload

  console.log('[CalendarC] Payload:', {
    user_id: userId,
    type,
    start_time: start_time.toISOString(),
    end_time: end_time.toISOString(),
    title,
    notes,
    repeats,
    repeat_interval,
  })

  const { error, data } = await supabase.from('CalendarItems').insert([
    {
      user_id: userId,
      type,
      start_time: start_time.toISOString(),
      end_time: end_time.toISOString(),
      title,
      notes,
      repeats,
      repeat_interval,
    },
  ])

  if (error) {
    console.error('[CalendarC] Supabase insert error (expanded):', error)
  } else {
    console.log('[CalendarC] Insert success:', data)
  }

  return error
}
