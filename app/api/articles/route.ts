import { type NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  // Authenticate via X-API-Key header
  const apiKey = req.headers.get('x-api-key')
  const expectedKey = process.env.PUBLISH_API_KEY

  if (!expectedKey) {
    return Response.json({ error: 'Server misconfiguration: PUBLISH_API_KEY not set' }, { status: 500 })
  }

  if (!apiKey || apiKey !== expectedKey) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    title_sk?: string
    text_sk?: string
    image_url?: string
    url?: string
    scraped_at?: string
  }

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.title_sk) {
    return Response.json({ error: 'title_sk is required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  const { data, error } = await db
    .from('articles')
    .insert({
      title_sk: body.title_sk,
      text_sk: body.text_sk ?? '',
      image_url: body.image_url ?? '',
      url: body.url ?? '',
      scraped_at: body.scraped_at ?? new Date().toISOString(),
      // Mirror Slovak content into the base columns so existing queries work
      title: body.title_sk,
      text: body.text_sk ?? '',
    })
    .select('id')
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ id: data.id }, { status: 201 })
}
