import { NextResponse } from 'next/server'

export const revalidate = 43200 // refresh every 12 hours (2x/day)

interface Participant {
  name: string
  short_name: string
  value: number | null
  is_home: boolean
}

interface RawMatch {
  start_date: string
  tour_name: string
  gender: 'M' | 'F'
  event_status: string
  participants: Participant[]
  venue_name: string
  series_id: number
}

export interface FIHMatch {
  date: string
  gender: 'M' | 'F'
  status: 'upcoming' | 'live' | 'completed' | 'cancelled'
  home: { name: string; short: string; score: number | null }
  away: { name: string; short: string; score: number | null }
  venue: string
  tourName: string
}

function extractFixtureData(html: string): RawMatch[] {
  // Extract JS-escaped JSON from window.fixtureWidgetData = '...'
  const match = html.match(/window\.fixtureWidgetData\s*=\s*'((?:[^'\\]|\\.)*)'/)
  if (!match) throw new Error('fixtureWidgetData not found')

  // Unescape JS string escapes
  const unescaped = match[1].replace(/\\(.)/g, '$1')

  let data: { matches?: RawMatch[] }
  try {
    data = JSON.parse(unescaped)
  } catch {
    // If full parse fails, try trimming to find valid JSON boundary
    // Walk backwards from end to find valid JSON
    let end = unescaped.length
    while (end > 0) {
      try {
        data = JSON.parse(unescaped.slice(0, end))
        break
      } catch {
        end = unescaped.lastIndexOf('}', end - 1) + 1
        if (end === 0) throw new Error('Could not parse fixtureWidgetData JSON')
      }
    }
    data = JSON.parse(unescaped.slice(0, end))
  }

  return data?.matches ?? []
}

function normalizeStatus(status: string): FIHMatch['status'] {
  if (status === 'Match Completed') return 'completed'
  if (status === 'In Progress') return 'live'
  if (status === 'Match Cancelled') return 'cancelled'
  return 'upcoming'
}

function normalizeMatch(m: RawMatch): FIHMatch {
  const home = m.participants.find(p => p.is_home) ?? m.participants[0]
  const away = m.participants.find(p => !p.is_home) ?? m.participants[1]
  return {
    date: m.start_date,
    gender: m.gender,
    status: normalizeStatus(m.event_status),
    home: { name: home?.name ?? '', short: home?.short_name ?? '', score: home?.value ?? null },
    away: { name: away?.name ?? '', short: away?.short_name ?? '', score: away?.value ?? null },
    venue: m.venue_name,
    tourName: m.tour_name,
  }
}

export async function GET() {
  try {
    const res = await fetch('https://www.fih.hockey/schedule-fixtures-results', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; pozemak-bot/1.0)' },
    })
    if (!res.ok) throw new Error(`FIH returned ${res.status}`)
    const html = await res.text()

    const raw = extractFixtureData(html)
    const now = new Date()

    // Separate completed vs upcoming
    const completed = raw
      .filter(m => m.event_status === 'Match Completed')
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())

    const upcoming = raw
      .filter(m => m.event_status === 'Yet to begin' || m.event_status === 'In Progress')
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())

    const recentMen = completed.filter(m => m.gender === 'M').slice(0, 5).map(normalizeMatch)
    const recentWomen = completed.filter(m => m.gender === 'F').slice(0, 5).map(normalizeMatch)
    const upcomingMen = upcoming.filter(m => m.gender === 'M').slice(0, 5).map(normalizeMatch)
    const upcomingWomen = upcoming.filter(m => m.gender === 'F').slice(0, 5).map(normalizeMatch)

    return NextResponse.json(
      { men: { recent: recentMen, upcoming: upcomingMen }, women: { recent: recentWomen, upcoming: upcomingWomen } },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' } }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[fih-api]', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
