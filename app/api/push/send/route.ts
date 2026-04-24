import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import apn from 'node-apn'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

function getApnProvider(): apn.Provider | null {
  const keyId = process.env.APNS_KEY_ID
  const teamId = process.env.APNS_TEAM_ID
  const raw = process.env.APNS_PRIVATE_KEY
  if (!keyId || !teamId || !raw) return null
  // Vercel stores multiline env vars with literal \n — restore real newlines
  const key = raw.replace(/\\n/g, '\n')
  return new apn.Provider({
    token: { key, keyId, teamId },
    production: process.env.NODE_ENV === 'production',
  })
}

export async function POST(req: NextRequest) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )
  // Require internal API key
  const apiKey = req.headers.get('x-api-key')
  if (apiKey !== process.env.PUBLISH_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, body, url } = await req.json()

  const db = getSupabaseAdmin()
  const { data: subs } = await db.from('push_subscriptions').select('endpoint, subscription')
  if (!subs?.length) return NextResponse.json({ sent: 0 })

  const payload = JSON.stringify({ title, body, url })
  let sent = 0
  const dead: string[] = []

  const apnProvider = getApnProvider()
  const bundleId = process.env.APNS_BUNDLE_ID || 'com.hockeyrefresh.app'

  await Promise.all(subs.map(async (row) => {
    const sub = JSON.parse(row.subscription)

    // Native APNs token
    if (sub.type === 'apns') {
      if (!apnProvider) return
      const note = new apn.Notification()
      note.expiry = Math.floor(Date.now() / 1000) + 3600
      note.badge = 1
      note.sound = 'default'
      note.alert = { title, body }
      note.payload = { url }
      note.topic = bundleId
      const result = await apnProvider.send(note, sub.token)
      if (result.sent.length) sent++
      if (result.failed.length) {
        console.error('APNs failed:', JSON.stringify(result.failed))
        dead.push(row.endpoint)
      }
      return
    }

    // Web push
    try {
      await webpush.sendNotification(sub, payload)
      sent++
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        dead.push(row.endpoint)
      }
    }
  }))

  if (apnProvider) apnProvider.shutdown()

  // Remove expired subscriptions
  if (dead.length) {
    await db.from('push_subscriptions').delete().in('endpoint', dead)
  }

  return NextResponse.json({ sent, total: subs.length, dead: dead.length })
}
