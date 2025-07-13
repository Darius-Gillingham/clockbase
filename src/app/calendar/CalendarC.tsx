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
    title,
    notes,
    repeats = false,
    repeat_interval = null,
  } = payload

  console.log('[CalendarC] Payload:', {
    userId,
    type,
    start_time,
    end_time,
    title,
    notes,
    repeats,
    repeat_interval,
  })

  const { data, error } = await supabase.from('CalendarItems').insert([
    {
      user_id: userId,
      type,
      start_time,
      end_time,
      title: title || null,
      notes: notes || null,
      repeats,
      repeat_interval,
    },
  ])

  if (error) {
    console.error('[CalendarC] Supabase insert error (expanded):', JSON.stringify(error, null, 2))
  } else {
    console.log('[CalendarC] Insert successful:', data)
  }

  return error
}
