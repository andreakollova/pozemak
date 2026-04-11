import { NextResponse } from 'next/server'

export const revalidate = 43200 // 2x/day

// FIH JSON has strings for is_home ("0"/"1") and value ("4"), not numbers
interface Participant {
  name: string
  short_name: string
  value: string | null   // score as string e.g. "3"
  is_home: string        // "0" or "1"
}

interface RawMatch {
  start_date: string
  tour_name: string
  gender: 'M' | 'F'
  event_status: string
  participants: Participant[]
  venue_name: string
  series_id: string
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

function normalizeStatus(s: string): FIHMatch['status'] {
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

function normalizeMatch(m: RawMatch): FIHMatch {
  const home = m.participants.find(p => p.is_home === '1' || p.is_home === 1 as unknown as string) ?? m.participants[0]
  const away = m.participants.find(p => p.is_home !== '1' && p.is_home !== 1 as unknown as string) ?? m.participants[1]
  return {
    date: m.start_date,
    gender: m.gender,
    status: normalizeStatus(m.event_status),
    home: { name: home?.name ?? '', short: home?.short_name ?? '', score: parseScore(home?.value ?? null) },
    away: { name: away?.name ?? '', short: away?.short_name ?? '', score: parseScore(away?.value ?? null) },
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

    const completed = raw
      .filter(m => m.event_status === 'Match Completed')
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())

    const upcoming = raw
      .filter(m => m.event_status === 'Yet to begin' || m.event_status === 'In Progress')
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())

    return NextResponse.json({
      men: {
        recent:   completed.filter(m => m.gender === 'M').slice(0, 20).map(normalizeMatch),
        upcoming: upcoming.filter(m => m.gender === 'M').slice(0, 20).map(normalizeMatch),
      },
      women: {
        recent:   completed.filter(m => m.gender === 'F').slice(0, 20).map(normalizeMatch),
        upcoming: upcoming.filter(m => m.gender === 'F').slice(0, 20).map(normalizeMatch),
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[fih-api]', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
