import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface RawEvent {
  id: number
  name: string
  gender: 'M' | 'F' | string
  startdate: string
  enddate: string
  location: string
  competition_id: number
}

export interface EuroHockeyEvent {
  id: number
  name: string
  gender: 'M' | 'F'
  startDate: string
  endDate: string
  location: string
  status: 'upcoming' | 'ongoing' | 'completed'
  eventUrl: string
  watchUrl: string
}

const WATCH_URL = 'https://www.eurohockeytv.org/en-int/page/home-eurohockey'

function normalizeEvent(e: RawEvent, status: EuroHockeyEvent['status']): EuroHockeyEvent {
  const gender = e.gender === 'F' ? 'F' : 'M'
  return {
    id: e.id,
    name: e.name,
    gender,
    startDate: e.startdate,
    endDate: e.enddate,
    location: e.location,
    status,
    eventUrl: `https://eurohockey.org/calendar/event?id=${e.id}`,
    watchUrl: WATCH_URL,
  }
}

export async function GET() {
  try {
    const res = await fetch('https://eurohockey.org/api/syncCompetitions?take=100', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; pozemak-bot/1.0)',
        Accept: 'application/json',
      },
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`EuroHockey API returned ${res.status}`)

    const data: { upcoming?: RawEvent[]; ongoing?: RawEvent[] } = await res.json()

    const now = new Date()

    const upcoming = (data.upcoming ?? [])
      .sort((a, b) => new Date(a.startdate).getTime() - new Date(b.startdate).getTime())
      .slice(0, 10)
      .map(e => normalizeEvent(e, 'upcoming'))

    const ongoing = (data.ongoing ?? [])
      .sort((a, b) => new Date(a.startdate).getTime() - new Date(b.startdate).getTime())
      .map(e => normalizeEvent(e, 'ongoing'))

    return NextResponse.json(
      { upcoming, ongoing },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' } }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[eurohockey-api]', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
