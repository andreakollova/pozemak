import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

// In-memory brute force protection — max 10 failed attempts per IP per 15 min
const attempts = new Map<string, { count: number; until: number }>()

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
}

export async function POST(req: NextRequest) {
  const ip = getIp(req)
  const now = Date.now()
  const entry = attempts.get(ip)

  if (entry && entry.count >= 10 && now < entry.until) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  const { username, password } = await req.json()

  if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
    attempts.delete(ip)
    const session = await getSession()
    session.isAdmin = true
    await session.save()
    return NextResponse.json({ ok: true })
  }

  // Failed — increment counter
  const count = (entry?.count ?? 0) + 1
  attempts.set(ip, { count, until: now + 15 * 60 * 1000 })

  return NextResponse.json({ error: 'Nesprávne meno alebo heslo' }, { status: 401 })
}
