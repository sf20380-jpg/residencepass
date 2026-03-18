import { supabase } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { error } = await supabase.from('visitors').select('id').limit(1)
  if (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
  }
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}
