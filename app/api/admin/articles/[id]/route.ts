import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import webpush from 'web-push'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Allow both admin session cookie and bot API key
  const apiKey = req.headers.get('x-api-key')
  const expectedKey = process.env.PUBLISH_API_KEY
  const session = await getSession()
  if (!session.isAdmin && (!apiKey || apiKey !== expectedKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const db = getSupabaseAdmin()

  const update: Record<string, unknown> = {}
  if (body.title_sk  !== undefined) update.title_sk  = body.title_sk
  if (body.text_sk   !== undefined) update.text_sk   = body.text_sk
  if (body.image_url !== undefined) update.image_url = body.image_url
  if (body.published  !== undefined) update.published  = body.published
  if (body.top_story  !== undefined) update.top_story  = body.top_story

  // Only one article can be top story at a time
  if (body.top_story === true) {
    await db.from('articles').update({ top_story: false }).neq('id', id)
  }

  const { error } = await db.from('articles').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send push notification when article is published
  if (body.published === true) {
    try {
      const { data: articleData } = await db.from('articles').select('title_sk, title, url').eq('id', id).single()
      const title = articleData?.title_sk || articleData?.title || 'New article'
      const slug = (articleData?.url || '').split('/').filter(Boolean).pop() || id

      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT!,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!,
      )
      const { data: subs } = await db.from('push_subscriptions').select('subscription')
      if (subs?.length) {
        const payload = JSON.stringify({ title: '🏑 Hockey Refresh', body: title, url: `/article/${slug}` })
        await Promise.all(subs.map(async (row) => {
          try { await webpush.sendNotification(JSON.parse(row.subscription), payload) } catch {}
        }))
      }
    } catch (e) {
      console.error('Push notification failed:', e)
    }
  }

  return NextResponse.json({ ok: true })
}
