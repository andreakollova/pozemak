import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token     = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId    = process.env.VERCEL_TEAM_ID

  if (!token || !projectId) {
    return NextResponse.json({ error: 'VERCEL_TOKEN or VERCEL_PROJECT_ID not set' }, { status: 500 })
  }

  const period = req.nextUrl.searchParams.get('period') || '7d'
  const days   = period === '30d' ? 30 : period === '90d' ? 90 : 7
  const now    = Date.now()
  const from   = now - days * 24 * 60 * 60 * 1000

  const base = new URLSearchParams({ projectId, from: String(from), to: String(now), environment: 'production' })
  if (teamId) base.set('teamId', teamId)

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  try {
    const [statsRes, pathRes] = await Promise.all([
      fetch(`https://vercel.com/api/web/insights/stats?${base}`, { headers }),
      fetch(`https://vercel.com/api/web/insights/path?${base}&limit=5`, { headers }),
    ])

    const stats = await statsRes.json()
    const paths = await pathRes.json()

    return NextResponse.json({ stats: stats.data ?? stats, paths: paths.data ?? paths })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
