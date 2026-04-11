import { NextResponse } from 'next/server'

export const revalidate = 3600 // 1h

const WC_URL = 'https://www.fih.hockey/events/fih-hockey-worldcup-belgium-netherlands-2026/schedule-fixtures-results'

interface Participant {
  name: string
  short_name: string
  value: string | null
  is_home: string
}

interface RawMatch {
  start_date: string
  tour_name: string
  gender: 'M' | 'F'
  event_status: string
  participants: Participant[]
  venue_name: string
  series_id: string
  game_id: string
  sr_game_id: string
  pool?: string
  time?: string   // venue local time e.g. "13:00"
  event_name?: string
  [key: string]: unknown
}

export interface WCMatch {
  date: string
  gender: 'M' | 'F'
  status: 'upcoming' | 'live' | 'completed' | 'cancelled'
  home: { name: string; short: string; score: number | null }
  away: { name: string; short: string; score: number | null }
  venue: string
  tourName: string
  pool: string
  eventName: string
  game_id: string
  sr_game_id: string
  series_id: string
  venueTime: string | null
}

function extractFixtureData(html: string): RawMatch[] {
  const match = html.match(/window\.fixtureWidgetData\s*=\s*'((?:[^'\\]|\\.)*)'/)
  if (!match) throw new Error('fixtureWidgetData not found')
  const unescaped = match[1].replace(/\\(.)/g, '$1')
  let data: { matches?: RawMatch[] }
  try {
    data = JSON.parse(unescaped)
  } catch {
    let end = unescaped.length
    while (end > 0) {
      const lastBrace = unescaped.lastIndexOf('}', end - 1)
      if (lastBrace === -1) throw new Error('Could not parse JSON')
      end = lastBrace + 1
      try { data = JSON.parse(unescaped.slice(0, end)); break }
      catch { end = lastBrace }
    }
    data = JSON.parse(unescaped.slice(0, end))
  }
  return data?.matches ?? []
}

function normalizeStatus(s: string): WCMatch['status'] {
  if (s === 'Match Completed') return 'completed'
  if (s === 'In Progress') return 'live'
  if (s === 'Match Cancelled') return 'cancelled'
  return 'upcoming'
}

function parseScore(v: string | null): number | null {
  if (!v && v !== '0') return null
  const n = parseInt(String(v), 10)
  return isNaN(n) ? null : n
}

function normalizeMatch(m: RawMatch): WCMatch {
  const first = m.participants[0]
  const second = m.participants[1]
  return {
    date: m.start_date,
    gender: m.gender,
    status: normalizeStatus(m.event_status),
    home: { name: first?.name ?? '', short: first?.short_name ?? '', score: parseScore(first?.value ?? null) },
    away: { name: second?.name ?? '', short: second?.short_name ?? '', score: parseScore(second?.value ?? null) },
    venue: m.venue_name ?? '',
    tourName: m.tour_name ?? '',
    pool: m.pool ?? '',
    eventName: m.event_name ?? '',
    game_id: m.game_id ?? '',
    sr_game_id: m.sr_game_id ?? '',
    series_id: m.series_id ?? '',
    venueTime: m.time ?? null,
  }
}

export async function GET() {
  try {
    const res = await fetch(WC_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; pozemak-bot/1.0)' },
    })
    if (!res.ok) throw new Error(`FIH returned ${res.status}`)
    const html = await res.text()
    const raw = extractFixtureData(html)

    const completed = raw
      .filter(m => m.event_status === 'Match Completed')
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())

    const upcoming = raw
      .filter(m => m.event_status !== 'Match Completed' && m.event_status !== 'Match Cancelled')
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())

    return NextResponse.json({
      men: {
        recent:   completed.filter(m => m.gender === 'M').map(normalizeMatch),
        upcoming: upcoming.filter(m => m.gender === 'M').map(normalizeMatch),
      },
      women: {
        recent:   completed.filter(m => m.gender === 'F').map(normalizeMatch),
        upcoming: upcoming.filter(m => m.gender === 'F').map(normalizeMatch),
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[fih-worldcup]', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
