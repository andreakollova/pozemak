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
  game_id: string
  sr_game_id: string
  // Potential timezone fields — may or may not be present in FIH data
  timezone?: string
  utc_offset?: string
  venue_timezone?: string
  local_start_time?: string
  start_date_local?: string
  [key: string]: unknown
}

export interface FIHMatch {
  date: string
  gender: 'M' | 'F'
  status: 'upcoming' | 'live' | 'completed' | 'cancelled'
  home: { name: string; short: string; score: number | null }
  away: { name: string; short: string; score: number | null }
  venue: string
  tourName: string
  game_id: string
  sr_game_id: string
  series_id: string
  venueTime?: string | null   // venue local time if available from raw data
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

// Keyword → IANA timezone lookup for venue names
const VENUE_TZ: Array<[RegExp, string]> = [
  // Americas
  [/santiago|chile/i,                      'America/Santiago'],
  [/lima|peru/i,                            'America/Lima'],
  [/buenos\s*aires|argentina/i,            'America/Argentina/Buenos_Aires'],
  [/bogot[aá]|colombia/i,                  'America/Bogota'],
  [/mexico\s*city|guadalajara|\bMEX\b/i,  'America/Mexico_City'],
  [/new\s*york|new\s*jersey|usa\b|united\s*states/i, 'America/New_York'],
  [/toronto|ontario|\bCAN\b|canada/i,      'America/Toronto'],
  [/vancouver|british\s*columbia/i,        'America/Vancouver'],
  [/montevideo|uruguay/i,                  'America/Montevideo'],
  [/caracas|venezuela/i,                   'America/Caracas'],
  // Europe
  [/amsterdam|netherlands|nederland/i,     'Europe/Amsterdam'],
  [/london|united\s*kingdom|\bGBR\b|\bENG\b|\bSCO\b|\bWAL\b/i, 'Europe/London'],
  [/dublin|ireland|\bIRL\b/i,              'Europe/Dublin'],
  [/berlin|germany|\bGER\b/i,              'Europe/Berlin'],
  [/brussels|belgium|\bBEL\b/i,            'Europe/Brussels'],
  [/madrid|spain|\bESP\b/i,               'Europe/Madrid'],
  [/paris|france|\bFRA\b/i,               'Europe/Paris'],
  [/rome|italy|\bITA\b/i,                 'Europe/Rome'],
  [/barcelona/i,                           'Europe/Madrid'],
  [/amsterdam/i,                           'Europe/Amsterdam'],
  // Africa
  [/johannesburg|pretoria|south\s*africa|\bRSA\b|\bSAF\b/i, 'Africa/Johannesburg'],
  [/cairo|egypt|\bEGY\b/i,                'Africa/Cairo'],
  [/nairobi|kenya|\bKEN\b/i,              'Africa/Nairobi'],
  // Asia
  [/tokyo|japan|\bJPN\b|oi\s*hockey/i,    'Asia/Tokyo'],
  [/seoul|korea|\bKOR\b/i,                'Asia/Seoul'],
  [/beijing|shanghai|china|\bCHN\b/i,     'Asia/Shanghai'],
  [/hong\s*kong|\bHKG\b/i,               'Asia/Hong_Kong'],
  [/taipei|taiwan|\bTPE\b/i,              'Asia/Taipei'],
  [/bangkok|thailand|\bTHA\b/i,           'Asia/Bangkok'],
  [/kuala\s*lumpur|malaysia|\bMAS\b/i,    'Asia/Kuala_Lumpur'],
  [/jakarta|indonesia|\bINA\b/i,          'Asia/Jakarta'],
  [/singapore|\bSIN\b|\bSGP\b/i,         'Asia/Singapore'],
  [/new\s*delhi|mumbai|india|\bIND\b/i,   'Asia/Kolkata'],
  [/dhaka|bangladesh|\bBAN\b|\bBGD\b/i,   'Asia/Dhaka'],
  [/karachi|lahore|pakistan|\bPAK\b/i,    'Asia/Karachi'],
  [/colombo|sri\s*lanka|\bSRI\b/i,        'Asia/Colombo'],
  [/muscat|oman|\bOMA\b/i,               'Asia/Muscat'],
  [/tashkent|uzbekistan|\bUZB\b/i,        'Asia/Tashkent'],
  // Oceania
  [/sydney|melbourne|brisbane|australia|\bAUS\b/i, 'Australia/Sydney'],
  [/auckland|new\s*zealand|\bNZL\b/i,     'Pacific/Auckland'],
]

function venueTimezone(venueName: string): string | null {
  for (const [re, tz] of VENUE_TZ) {
    if (re.test(venueName)) return tz
  }
  return null
}

function extractVenueTime(m: RawMatch): string | null {
  const tz = venueTimezone(m.venue_name ?? '')
  if (!tz) return null
  try {
    const d = new Date(m.start_date)
    if (isNaN(d.getTime())) return null
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz })
  } catch { return null }
}

function normalizeMatch(m: RawMatch): FIHMatch {
  // Use participants array order — FIH displays participants[0] first in URLs and UI
  const first = m.participants[0]
  const second = m.participants[1]
  return {
    date: m.start_date,
    gender: m.gender,
    status: normalizeStatus(m.event_status),
    home: { name: first?.name ?? '', short: first?.short_name ?? '', score: parseScore(first?.value ?? null) },
    away: { name: second?.name ?? '', short: second?.short_name ?? '', score: parseScore(second?.value ?? null) },
    venue: m.venue_name,
    tourName: m.tour_name,
    game_id: m.game_id ?? '',
    sr_game_id: m.sr_game_id ?? '',
    series_id: m.series_id ?? '',
    venueTime: extractVenueTime(m),
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

    // _debug_raw: expose first upcoming raw match so we can discover available fields
    const debugRaw = upcoming[0] ?? completed[0] ?? null

    return NextResponse.json({
      men: {
        recent:   completed.filter(m => m.gender === 'M').slice(0, 20).map(normalizeMatch),
        upcoming: upcoming.filter(m => m.gender === 'M').slice(0, 20).map(normalizeMatch),
      },
      women: {
        recent:   completed.filter(m => m.gender === 'F').slice(0, 20).map(normalizeMatch),
        upcoming: upcoming.filter(m => m.gender === 'F').slice(0, 20).map(normalizeMatch),
      },
      _debug_raw: debugRaw,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[fih-api]', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
