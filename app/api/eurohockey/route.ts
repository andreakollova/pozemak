import { NextResponse } from 'next/server'

export const revalidate = 43200 // 2x/day

interface RawCompetition {
  id: string
  name: string
  gender: string
  startdate: string
  enddate: string
  location: string
  competition_id: number
}

export interface EuroMatch {
  id: string
  tournamentName: string
  gender: 'M' | 'F'
  date: string
  status: 'upcoming' | 'live' | 'completed'
  home: { name: string; code: string; logo: string | null; score: number | null }
  away: { name: string; code: string; logo: string | null; score: number | null }
  location: string
  eventUrl: string
  watchUrl: string
}

const WATCH_URL = 'https://www.eurohockeytv.org/en-int/page/home-eurohockey'

// Extract __NEXT_DATA__ from a EuroHockey event page and return match fixtures
async function fetchEventMatches(comp: RawCompetition): Promise<EuroMatch[]> {
  const url = `https://eurohockey.org/calendar/event?id=${comp.id}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; pozemak-bot/1.0)' },
  })
  if (!res.ok) return []
  const html = await res.text()

  // Extract __NEXT_DATA__
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!m) return []
  let pageData: any
  try { pageData = JSON.parse(m[1]) } catch { return [] }

  const fixtures: any[] = pageData?.props?.pageProps?.competition?.fixtures ?? []
  const gender: 'M' | 'F' = comp.gender === 'F' ? 'F' : 'M'

  return fixtures.map((f: any): EuroMatch => {
    const homeTeam = f.homeTeam ?? f.home_team ?? {}
    const awayTeam = f.awayTeam ?? f.away_team ?? {}
    const homeScore = f.homeScore ?? f.home_score ?? null
    const awayScore = f.awayScore ?? f.away_score ?? null
    const isCompleted = homeScore !== null && awayScore !== null
    const date = f.date ?? f.startTime ?? f.start_time ?? f.scheduled ?? ''

    return {
      id: String(f.id ?? f.game_id ?? Math.random()),
      tournamentName: comp.name,
      gender,
      date,
      status: isCompleted ? 'completed' : 'upcoming',
      home: {
        name: homeTeam.name ?? homeTeam.code ?? '',
        code: homeTeam.code ?? homeTeam.name ?? '',
        logo: homeTeam.logoMedia?.media?.url ?? homeTeam.logo ?? null,
        score: homeScore !== null ? parseInt(String(homeScore), 10) : null,
      },
      away: {
        name: awayTeam.name ?? awayTeam.code ?? '',
        code: awayTeam.code ?? awayTeam.name ?? '',
        logo: awayTeam.logoMedia?.media?.url ?? awayTeam.logo ?? null,
        score: awayScore !== null ? parseInt(String(awayScore), 10) : null,
      },
      location: comp.location,
      eventUrl: url,
      watchUrl: WATCH_URL,
    }
  })
}

export async function GET() {
  try {
    const listRes = await fetch('https://eurohockey.org/api/syncCompetitions?take=100', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; pozemak-bot/1.0)', Accept: 'application/json' },
    })
    if (!listRes.ok) throw new Error(`EuroHockey API returned ${listRes.status}`)
    const listData: { upcoming?: RawCompetition[]; ongoing?: RawCompetition[] } = await listRes.json()

    const now = new Date()
    const soon = new Date(now.getTime() + 60 * 24 * 3600 * 1000) // 60 days ahead

    // Ongoing first, then upcoming within 60 days
    const ongoing = listData.ongoing ?? []
    const upcomingSoon = (listData.upcoming ?? [])
      .filter(c => new Date(c.startdate) <= soon)
      .sort((a, b) => new Date(a.startdate).getTime() - new Date(b.startdate).getTime())
      .slice(0, 6)

    const toFetch = [...ongoing, ...upcomingSoon].slice(0, 8)

    // Fetch matches for each competition in parallel
    const matchArrays = await Promise.all(toFetch.map(c => fetchEventMatches(c).catch(() => [])))
    const allMatches = matchArrays.flat()

    // If we got no fixture data from pages, fall back to tournament cards
    const tournaments = toFetch.map(c => ({
      id: c.id,
      name: c.name,
      gender: c.gender === 'F' ? 'F' : 'M',
      startDate: c.startdate,
      endDate: c.enddate,
      location: c.location,
      status: ongoing.find(o => o.id === c.id) ? 'ongoing' : 'upcoming',
      eventUrl: `https://eurohockey.org/calendar/event?id=${c.id}`,
      watchUrl: WATCH_URL,
    }))

    return NextResponse.json({ matches: allMatches, tournaments })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[eurohockey-api]', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
