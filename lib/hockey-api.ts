/**
 * Hockey API client for app.hockeyweerelt.nl
 * Handles HAPI device registration + request signing.
 */

import crypto from 'crypto'

const API_BASE = 'https://app.hockeyweerelt.nl'
const HAPI_VERSION = '7'

// Module-level cache — persists across requests in the same Node.js process
let _token: string | null = null
let _uuid: string = process.env.HOCKEY_DEVICE_UUID || _generateUUID()

function _generateUUID(): string {
  return crypto.randomUUID()
}

function _cleanPath(path: string): string {
  return path.replace(/[^a-zA-Z0-9\-/]/g, '')
}

function _cleanParamValue(value: string): string {
  return value.replace(/[^a-zA-Z0-9\-/=]/g, '')
}

function _computeSignature(
  timestamp: number,
  path: string,
  params: Record<string, string>,
  uuid: string,
): string {
  const cleanedPath = _cleanPath(path)
  const cleanedParams = Object.entries(params)
    .map(([k, v]) => `${_cleanParamValue(k)}=${_cleanParamValue(v)}`)
    .join('')
  const reversedUuid = uuid.split('').reverse().join('')
  const str = `${timestamp}${cleanedPath}${cleanedParams}${reversedUuid}`
  return crypto.createHash('sha1').update(str).digest('hex')
}

async function _ensureToken(): Promise<string> {
  if (_token) return _token
  const res = await fetch(`${API_BASE}/device/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ uuid: _uuid, os: 'Web' }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Device register failed: ${res.status}`)
  const data = await res.json()
  _token = data.token as string
  return _token
}

export async function hapiGet(path: string, params: Record<string, string> = {}): Promise<unknown> {
  const token = await _ensureToken()
  const timestamp = Math.floor(Date.now() / 1000)

  const qs = new URLSearchParams(params).toString()
  const url = `${API_BASE}${path}${qs ? '?' + qs : ''}`
  const signature = _computeSignature(timestamp, path, params, _uuid)

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-HAPI-Authorization': token,
      'X-HAPI-Version': HAPI_VERSION,
      'X-HAPI-Timestamp': String(timestamp),
      'X-HAPI-Signature': signature,
    },
    next: { revalidate: 300 }, // cache 5 minutes
  })

  if (res.status === 401) {
    // Token expired — re-register
    _token = null
    const freshToken = await _ensureToken()
    const ts2 = Math.floor(Date.now() / 1000)
    const sig2 = _computeSignature(ts2, path, params, _uuid)
    const res2 = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-HAPI-Authorization': freshToken,
        'X-HAPI-Version': HAPI_VERSION,
        'X-HAPI-Timestamp': String(ts2),
        'X-HAPI-Signature': sig2,
      },
      next: { revalidate: 300 },
    })
    if (!res2.ok) throw new Error(`HAPI ${path} → ${res2.status}`)
    return res2.json()
  }

  if (!res.ok) throw new Error(`HAPI ${path} → ${res.status}`)
  return res.json()
}

// ── Typed helpers ─────────────────────────────────────────────────────────────

export interface HockeyTeam {
  id: number
  name: string
  logo: string | null
}

export interface Standing {
  rank: number
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  points: number
  team: HockeyTeam
}

export interface Match {
  id: number
  date: string
  status: 'final' | 'scheduled' | 'live' | string
  home: HockeyTeam
  away: HockeyTeam
  score: { home: number; away: number } | null
  round: number | null
}

export interface Poule {
  id: number
  name: string
  standings: Standing[]
  matches: Match[]
}

export interface CompetitionData {
  id: number
  name: string
  poules: Poule[]        // national
  standings?: Standing[] // international (flat)
  matches?: Match[]      // international (flat)
}

export async function getNationalCompetition(id: number): Promise<CompetitionData> {
  const json = await hapiGet(`/competitions/national/${id}`) as { data: CompetitionData }
  return json.data
}

export async function getInternationalCompetition(id: number): Promise<CompetitionData> {
  const json = await hapiGet(`/competitions/international/${id}`) as { data: CompetitionData }
  // Normalise to same shape as national (single "poule")
  const d = json.data as CompetitionData & { standings?: Standing[]; matches?: Match[] }
  if (!d.poules && d.standings) {
    d.poules = [{
      id: id,
      name: d.name,
      standings: d.standings ?? [],
      matches: d.matches ?? [],
    }]
  }
  return d
}
