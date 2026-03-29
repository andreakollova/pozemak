import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

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

  const { error } = await db.from('articles').update({
    title_sk: body.title_sk,
    text_sk: body.text_sk,
    image_url: body.image_url,
  }).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
