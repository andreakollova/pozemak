import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST(req: NextRequest) {
  // Require internal API key
  const apiKey = req.headers.get('x-api-key')
  if (apiKey !== process.env.PUBLISH_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, body, url } = await req.json()

  const db = getSupabaseAdmin()
  const { data: subs } = await db.from('push_subscriptions').select('subscription')
  if (!subs?.length) return NextResponse.json({ sent: 0 })

  const payload = JSON.stringify({ title, body, url })
  let sent = 0
  const dead: string[] = []

  await Promise.all(subs.map(async (row) => {
    try {
      const sub = JSON.parse(row.subscription)
      await webpush.sendNotification(sub, payload)
      sent++
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        dead.push(JSON.parse(row.subscription).endpoint)
      }
    }
  }))

  // Remove expired subscriptions
  if (dead.length) {
    await db.from('push_subscriptions').delete().in('endpoint', dead)
  }

  return NextResponse.json({ sent })
}
