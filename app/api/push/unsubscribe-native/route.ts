import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const db = getSupabaseAdmin()
  await db.from('push_subscriptions').delete().eq('endpoint', `apns:${token}`)

  return NextResponse.json({ ok: true })
}
