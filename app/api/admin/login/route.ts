import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
    const session = await getSession()
    session.isAdmin = true
    await session.save()
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Nesprávne meno alebo heslo' }, { status: 401 })
}
