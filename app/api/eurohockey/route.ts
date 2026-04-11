import { NextResponse } from 'next/server'

export const revalidate = 43200 // 2x/day

export interface EuroMatch {
  id: string
  tournamentName: string
  gender: 'M' | 'F'
  date: string
  status: 'upcoming' | 'live' | 'completed'
  home: { name: string; code: string; logo: string | null; score: number | null }
  away: { name: string; code: string; logo: string | null; score: number | null }
  eventUrl: string
  watchUrl: string
}

export interface EuroTournament {
  id: string
  name: string
  gender: 'M' | 'F'
  startDate: string
  endDate: string
  location: string
  status: 'upcoming' | 'ongoing'
  eventUrl: string
  watchUrl: string
}

const WATCH_URL = 'https://www.eurohockeytv.org/en-int/page/home-eurohockey'

function genderFromName(name: string): 'M' | 'F' {
  return /women/i.test(name) ? 'F' : 'M'
}

export async function GET() {
  try {
    // Single fetch of the calendar page — contains all upcoming matches in __NEXT_DATA__
    const res = await fetch('https://eurohockey.org/calendar', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; pozemak-bot/1.0)' },
    })
    if (!res.ok) throw new Error(`EuroHockey calendar returned ${res.status}`)
    const html = await res.text()

    const nd = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
    if (!nd) throw new Error('__NEXT_DATA__ not found')
    const pageData = JSON.parse(nd[1])
    const pp = pageData?.props?.pageProps ?? {}

    // ── Upcoming matches (325 entries, sorted by date) ──
    const raw: any[] = pp.upcomingEvents ?? []
    const matches: EuroMatch[] = raw.map((e: any, i: number): EuroMatch => {
      const comp = e.competition ?? {}
      const home = e.hometeam ?? {}
      const away = e.awayteam ?? {}
      const gender = genderFromName(comp.name ?? '')
      return {
        id: String(e.id ?? i),
        tournamentName: comp.name ?? '',
        gender,
        date: e.datetimeutc ?? '',
        status: e.status === 'Upcoming' ? 'upcoming' : 'live',
        home: {
          name: home.name ?? home.code ?? '',
          code: home.code ?? '',
          logo: home.logoMedia?.media?.url ?? null,
          score: null,
        },
        away: {
          name: away.name ?? away.code ?? '',
          code: away.code ?? '',
          logo: away.logoMedia?.media?.url ?? null,
          score: null,
        },
        eventUrl: comp.id ? `https://eurohockey.org/calendar/event?id=${comp.id}` : 'https://eurohockey.org/calendar',
        watchUrl: comp.whereToWatch || WATCH_URL,
      }
    })

    // ── Tournaments from graphCalendarEvents ──
    const calEvents: any[] = pp.graphCalendarEvents ?? []
    const seen = new Set<string>()
    const tournaments: EuroTournament[] = calEvents
      .filter((e: any) => {
        if (seen.has(e.id)) return false
        seen.add(e.id)
        return true
      })
      .map((e: any): EuroTournament => ({
        id: String(e.id),
        name: e.name ?? e.title ?? '',
        gender: genderFromName(e.name ?? e.title ?? ''),
        startDate: e.startdate ?? e.start ?? '',
        endDate: e.enddate ?? e.end ?? '',
        location: e.location ?? '',
        status: e.competition_status === 'ongoing' ? 'ongoing' : 'upcoming',
        eventUrl: `https://eurohockey.org/calendar/event?id=${e.id}`,
        watchUrl: WATCH_URL,
      }))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 60)

    return NextResponse.json({ matches, tournaments })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[eurohockey-api]', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
