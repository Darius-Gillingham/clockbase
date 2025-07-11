// File: lib/saveCalendarItem.ts
// Commit: helper to insert new calendar item into CalendarItems table

import { supabase } from '@/lib/supabaseClient'

export async function saveCalendarItem({
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

  return error
}
