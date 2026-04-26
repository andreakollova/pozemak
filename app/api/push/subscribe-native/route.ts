import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { token, platform, maxPerDay } = await req.json()
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const db = getSupabaseAdmin()
  await db.from('push_subscriptions').upsert(
    {
      endpoint: `apns:${token}`,
      subscription: JSON.stringify({
        type: 'apns', token, platform,
        maxPerDay: maxPerDay ?? null,
        sentToday: 0,
        lastSentDate: '',
      }),
    },
    { onConflict: 'endpoint' }
  )

  return NextResponse.json({ ok: true })
}
