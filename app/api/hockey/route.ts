import { NextRequest, NextResponse } from 'next/server'
import { getNationalCompetition, getInternationalCompetition } from '@/lib/hockey-api'

export const dynamic = 'force-dynamic'

// GET /api/hockey?comp=national&id=1
// GET /api/hockey?comp=international&id=44
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const comp = searchParams.get('comp') // 'national' | 'international'
  const id   = Number(searchParams.get('id'))

  if (!comp || !id) {
    return NextResponse.json({ error: 'Missing comp or id' }, { status: 400 })
  }

  try {
    const data =
      comp === 'international'
        ? await getInternationalCompetition(id)
        : await getNationalCompetition(id)

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[hockey-api]', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
