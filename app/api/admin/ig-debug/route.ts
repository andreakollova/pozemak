import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return NextResponse.json({ error: 'INSTAGRAM_ACCESS_TOKEN not set' }, { status: 500 })

  const BASE = 'https://graph.facebook.com/v21.0'

  // 1. Token info
  const meRes = await fetch(`${BASE}/me?fields=id,name&access_token=${token}`)
  const me = await meRes.json()

  // 2. Pages + Instagram Business Account IDs
  const pagesRes = await fetch(`${BASE}/me/accounts?fields=id,name,instagram_business_account&access_token=${token}`)
  const pages = await pagesRes.json()

  return NextResponse.json({ me, pages: pages.data ?? pages })
}
