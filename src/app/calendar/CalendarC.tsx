// File: app/calendar/CalendarC.ts
// Commit: log Supabase insert errors for debugging availability creation

import { supabase } from '@/lib/supabaseClient'

export async function CalendarC({
  userId,
  type,
  start_time,
  end_time,
  title,
  notes,
  repeats,
  repeat_interval,
}: {
  userId: string
  type: 'scheduled_shift' | 'availability' | 'event'
  start_time: Date
  end_time: Date
  title?: string
  notes?: string
  repeats?: boolean
  repeat_interval?: 'weekly' | null
}) {
  const { error } = await supabase.from('CalendarItems').insert([
    {
      user_id: userId,
      type,
      start_time: start_time.toISOString(),
      end_time: end_time.toISOString(),
      title: title || null,
      notes: notes || null,
      repeats: repeats ?? false,
      repeat_interval: repeat_interval ?? null,
    },
  ])

  if (error) {
    console.error('[CalendarC] Supabase insert error:', error)
  }

  return error
}
