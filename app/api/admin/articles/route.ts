import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const db = getSupabaseAdmin()

  const { data, error } = await db.from('articles').insert({
    url: body.url || `https://pozemak.sk/clanok/${Date.now()}`,
    title: body.title || '',
    text: body.text || '',
    title_sk: body.title_sk || body.title || '',
    text_sk: body.text_sk || body.text || '',
    image_url: body.image_url || '',
    scraped_at: new Date().toISOString(),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, article: data })
}
