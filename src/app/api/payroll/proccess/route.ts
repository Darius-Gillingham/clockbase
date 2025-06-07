import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface ShiftRecord {
  start: string
  end: string
  range?: string
}

export async function POST(req: NextRequest) {
  const { userId, date }: { userId: string; date: string } = await req.json()

  if (!userId || !date) {
    return NextResponse.json({ error: 'Missing userId or date' }, { status: 400 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Supabase credentials are missing from the environment.' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const filename = `${userId}-${date}.json`
  const bucket = 'shift-json'

  const { data: file, error } = await supabase.storage
    .from(bucket)
    .download(filename)

  if (error || !file) {
    return NextResponse.json({ error: 'Shift file not found.' }, { status: 404 })
  }

  try {
    const text = await file.text()
    const shifts: ShiftRecord[] = JSON.parse(text)

    return NextResponse.json({ date, shifts })
  } catch {
    return NextResponse.json({ error: 'Invalid JSON format in shift file.' }, { status: 400 })
  }
}
