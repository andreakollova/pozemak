import { NextResponse } from 'next/server'

export const revalidate = 43200 // 2x/day

interface Participant {
  name: string
  short_name: string
  value: string | null   // score as string
  is_home: string        // "0" or "1"
}

interface RawMatch {
  start_date: string
  tour_name: string
  gender: 'M' | 'F'
  event_status: string
  participants: Participant[]
  venue_name: string
  series_id: string      // string "1820", not number
  watch_live_url: string | null
}

export interface ProLeagueMatch {
  date: string
  gender: 'M' | 'F'
  status: 'upcoming' | 'live' | 'completed' | 'cancelled'
  home: { name: string; short: string; score: number | null }
  away: { name: string; short: string; score: number | null }
  venue: string
  watchLiveUrl: string | null
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
  // Men = "1820", Women = "1819"
  return (data?.matches ?? []).filter(m => String(m.series_id) === '1820' || String(m.series_id) === '1819')
}

function normalizeStatus(s: string): ProLeagueMatch['status'] {
  if (s === 'Match Completed') return 'completed'
  if (s === 'In Progress') return 'live'
  if (s === 'Match Cancelled') return 'cancelled'
  return 'upcoming'
}

function parseScore(v: string | null): number | null {
  if (v === null || v === '' || v === undefined) return null
  const n = parseInt(String(v), 10)
  return isNaN(n) ? null : n
}

function normalizeMatch(m: RawMatch): ProLeagueMatch {
  const home = m.participants.find(p => p.is_home === '1') ?? m.participants[0]
  const away = m.participants.find(p => p.is_home !== '1') ?? m.participants[1]
  return {
    date: m.start_date,
    gender: m.gender,
    status: normalizeStatus(m.event_status),
    home: { name: home?.name ?? '', short: home?.short_name ?? '', score: parseScore(home?.value ?? null) },
    away: { name: away?.name ?? '', short: away?.short_name ?? '', score: parseScore(away?.value ?? null) },
    venue: m.venue_name,
    watchLiveUrl: m.watch_live_url ?? null,
  }
}

export async function GET() {
  try {
    const res = await fetch(
      'https://www.fih.hockey/events/fih-pro-league/schedule-fixtures-results',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; pozemak-bot/1.0)' } }
    )
    if (!res.ok) throw new Error(`FIH Pro League returned ${res.status}`)
    const html = await res.text()
    const raw = extractFixtureData(html)

    const completed = raw
      .filter(m => m.event_status === 'Match Completed')
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())

    const upcoming = raw
      .filter(m => m.event_status === 'Yet to begin' || m.event_status === 'In Progress')
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())

    const watchLiveUrl = upcoming.find(m => m.watch_live_url)?.watch_live_url ?? null

    return NextResponse.json({
      men: {
        recent:   completed.filter(m => m.gender === 'M').slice(0, 20).map(normalizeMatch),
        upcoming: upcoming.filter(m => m.gender === 'M').slice(0, 20).map(normalizeMatch),
      },
      women: {
        recent:   completed.filter(m => m.gender === 'F').slice(0, 20).map(normalizeMatch),
        upcoming: upcoming.filter(m => m.gender === 'F').slice(0, 20).map(normalizeMatch),
      },
      watchLiveUrl,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[fih-pro-league-api]', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
