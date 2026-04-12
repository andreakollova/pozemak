'use client'

import { useState, useRef, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Clapperboard } from 'lucide-react'
import type { Match, Poule } from '@/lib/hockey-api'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface FIHMatch {
  date: string; gender: 'M' | 'F'; status: 'upcoming' | 'live' | 'completed' | 'cancelled'
  home: { name: string; short: string; score: number | null }
  away: { name: string; short: string; score: number | null }
  venue: string; tourName: string
  game_id: string; sr_game_id: string; series_id: string
  venueTime?: string | null
}
export interface FIHGenderData { recent: FIHMatch[]; upcoming: FIHMatch[] }
export interface FIHData { men: FIHGenderData; women: FIHGenderData }

export interface ProLeagueMatch {
  date: string; gender: 'M' | 'F'; status: string
  home: { name: string; short: string; score: number | null }
  away: { name: string; short: string; score: number | null }
  venue: string; watchLiveUrl: string | null
}
export interface ProLeagueGenderData { recent: ProLeagueMatch[]; upcoming: ProLeagueMatch[] }
export interface ProLeagueData { men: ProLeagueGenderData; women: ProLeagueGenderData; watchLiveUrl: string | null }

export interface EuroEvent {
  id: string; name: string; gender: 'M' | 'F'; startDate: string; endDate: string
  location: string; status: 'upcoming' | 'ongoing' | 'completed'
  eventUrl: string; watchUrl: string
}
export interface EuroMatch {
  id: string; tournamentName: string; gender: 'M' | 'F'; date: string
  status: 'upcoming' | 'live' | 'completed'
  home: { name: string; code: string; logo: string | null; score: number | null }
  away: { name: string; code: string; logo: string | null; score: number | null }
  location: string; eventUrl: string; watchUrl: string
}
export interface EuroData { matches: EuroMatch[]; tournaments: EuroEvent[] }

export interface WCMatch {
  date: string; gender: 'M' | 'F'; status: 'upcoming' | 'live' | 'completed' | 'cancelled'
  home: { name: string; short: string; score: number | null }
  away: { name: string; short: string; score: number | null }
  venue: string; tourName: string; pool: string; eventName: string
  game_id: string; sr_game_id: string; series_id: string
  venueTime: string | null
}
export interface WCGenderData { recent: WCMatch[]; upcoming: WCMatch[] }
export interface WCData { men: WCGenderData; women: WCGenderData }

export interface NormMatch {
  key: string; date: string; gender: 'M' | 'F'
  status: 'upcoming' | 'live' | 'completed' | 'cancelled'
  home: { name: string; short: string; score: number | null; logo?: string | null }
  away: { name: string; short: string; score: number | null; logo?: string | null }
  tourName: string; pool?: string | null
  watchUrl?: string | null; moreUrl?: string | null; eventUrl?: string | null
  venueTime?: string | null
}

export interface MatchData { name: string; results: Match[]; upcoming: Match[]; gender: 'men' | 'women' }

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const FLAG: Record<string, string> = {
  NED:'🇳🇱', GBR:'🇬🇧', ENG:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', SCO:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', WAL:'🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  AUS:'🇦🇺', GER:'🇩🇪', BEL:'🇧🇪', ESP:'🇪🇸', ARG:'🇦🇷', IND:'🇮🇳', NZL:'🇳🇿',
  RSA:'🇿🇦', IRL:'🇮🇪', CAN:'🇨🇦', USA:'🇺🇸', CHN:'🇨🇳', JPN:'🇯🇵', KOR:'🇰🇷',
  PAK:'🇵🇰', MAS:'🇲🇾', FRA:'🇫🇷', AUT:'🇦🇹', POL:'🇵🇱', CZE:'🇨🇿', SUI:'🇨🇭',
  UKR:'🇺🇦', TPE:'🇹🇼', BAN:'🇧🇩', BGD:'🇧🇩', SRI:'🇱🇰', UZB:'🇺🇿', THA:'🇹🇭',
  SIN:'🇸🇬', SGP:'🇸🇬', HKG:'🇭🇰', OMA:'🇴🇲', KAZ:'🇰🇿', AZE:'🇦🇿',
  LTU:'🇱🇹', CRO:'🇭🇷', SVK:'🇸🇰', TUR:'🇹🇷', ITA:'🇮🇹', POR:'🇵🇹',
  GRE:'🇬🇷', ROM:'🇷🇴', HUN:'🇭🇺', DEN:'🇩🇰', SWE:'🇸🇪', NOR:'🇳🇴', FIN:'🇫🇮',
  LAT:'🇱🇻', CHL:'🇨🇱', CHI:'🇨🇱', MEX:'🇲🇽', URU:'🇺🇾', VEN:'🇻🇪', BRA:'🇧🇷',
  EGY:'🇪🇬', GHA:'🇬🇭', KEN:'🇰🇪', ZIM:'🇿🇼', NGR:'🇳🇬', NIG:'🇳🇬', BLR:'🇧🇾',
  RUS:'🇷🇺', MGL:'🇲🇳', MYA:'🇲🇲', VIE:'🇻🇳', PHI:'🇵🇭', INA:'🇮🇩', IRN:'🇮🇷',
  MKD:'🇲🇰', SLO:'🇸🇮', EST:'🇪🇪', BIH:'🇧🇦', BUL:'🇧🇬', SRB:'🇷🇸',
  SAF:'🇿🇦', TTO:'🇹🇹', PER:'🇵🇪', COL:'🇨🇴', ECU:'🇪🇨', PAN:'🇵🇦', GUA:'🇬🇹',
}
export function flag(short: string) { return FLAG[short?.toUpperCase()] ?? '' }

export function fmtMatchDate(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function fmtLocalTime(iso: string): string | null {
  if (!iso.match(/T\d{2}:\d{2}/)) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const MATCH_BUFFER_MS = 3 * 60 * 60 * 1000
export function notPast(date: string): boolean {
  return new Date(date).getTime() + MATCH_BUFFER_MS > Date.now()
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function fihMatchUrl(m: FIHMatch): string | null {
  if (!m.game_id || !m.sr_game_id) return null
  const gender = m.gender === 'M' ? 'men' : 'women'
  const seriesSlug = `${slugify(m.tourName)}-${m.series_id}`
  const homeSlug = slugify(m.home.name)
  const awaySlug = slugify(m.away.name)
  return `https://www.fih.hockey/events/others/${gender}/${seriesSlug}/live-scores/${homeSlug}-vs-${awaySlug}-${m.game_id}?matchcenter=${m.sr_game_id}`
}

export function getMatches(d: { poules?: Poule[]; matches?: Match[] }): Match[] {
  if (d.poules?.length) return d.poules.flatMap(p => p.matches)
  return d.matches ?? []
}

export function getRecentResults(matches: Match[], limit = 5): Match[] {
  return matches.filter(m => m.status === 'final' && m.score)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

export function getUpcomingMatches(matches: Match[], limit = 5): Match[] {
  return matches.filter(m => m.status !== 'final' && m.status !== 'live' && notPast(m.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit)
}

/* ─── Shared UI ──────────────────────────────────────────────────────────── */

export function CarouselHeader({ title, href, hrefLabel, controls }: { title: string; href: string; hrefLabel: string; controls: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: 0.3, color: 'var(--text-primary)' }}>{title}</span>
        <div style={{ height: 1, background: 'var(--border)', width: 32 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {controls}
        <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', letterSpacing: 1 }}>{hrefLabel} →</a>
      </div>
    </div>
  )
}

export function TabPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{ padding: '5px 13px', border: 'none', borderRadius: 20, background: active ? 'var(--accent)' : 'var(--bg-card)', color: active ? 'var(--pill-active-text)' : 'var(--text-secondary)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s' }}>
      {label}
    </button>
  )
}

function TeamCell({ short, name, won, logo }: { short: string; name: string; won: boolean; logo?: string | null }) {
  const f = flag(short)
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 0 }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
        {logo
          ? <img src={logo} alt={name} style={{ width: 28, height: 28, objectFit: 'contain' }} />
          : f
            ? <span style={{ fontSize: 22, lineHeight: 1 }}>{f}</span>
            : <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.15, padding: '0 2px' }}>{(short || name.split(' ')[0]).slice(0, 5).toUpperCase()}</span>
        }
      </div>
      <span style={{ fontSize: 10, fontWeight: won ? 800 : 400, color: won ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 64 }}>
        {short || name}
      </span>
    </div>
  )
}

function TeamLogo({ logo, name }: { logo: string | null; name: string }) {
  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
      {logo ? <img src={logo} alt={name} style={{ width: 26, height: 26, objectFit: 'contain' }} /> : <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-primary)' }}>{name[0]}</span>}
    </div>
  )
}

const ScrollBtn = ({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) => (
  <button onClick={onClick} style={{ width: 26, height: 26, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
  >
    {dir === 'left' ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
  </button>
)

/* ─── Match cards ────────────────────────────────────────────────────────── */

function MatchCarouselCard({ match: m, isResult }: { match: FIHMatch | ProLeagueMatch; isResult: boolean }) {
  const homeWon  = isResult && m.home.score !== null && m.away.score !== null && m.home.score > m.away.score
  const awayWon  = isResult && m.home.score !== null && m.away.score !== null && m.away.score > m.home.score
  const isLive   = m.status === 'live'
  const watchUrl = 'watchLiveUrl' in m ? m.watchLiveUrl : null
  const moreUrl  = 'game_id' in m ? fihMatchUrl(m as FIHMatch) : null
  const tourName = 'tourName' in m ? m.tourName : ''
  const logo = (t: typeof m.home) => ('logo' in t ? (t as any).logo : null)
  const genderColor = m.gender === 'M' ? '#003ad0' : '#e0336c'
  const venueTime = 'venueTime' in m ? (m as FIHMatch).venueTime ?? null : null
  const myTime    = fmtLocalTime(m.date)
  return (
    <div style={{ flexShrink: 0, width: 184, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: `3px solid ${genderColor}`, padding: '11px 12px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 4 }}>
        <TeamCell short={m.home.short} name={m.home.name} won={homeWon} logo={logo(m.home)} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, minWidth: 44 }}>
          {isLive
            ? <span style={{ fontSize: 9, fontWeight: 800, color: '#e33', letterSpacing: 1 }}>● LIVE</span>
            : isResult && m.home.score !== null && m.away.score !== null
              ? <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1 }}>{m.home.score}-{m.away.score}</span>
              : <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>vs</span>
          }
          {isResult && !isLive && <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>FT</span>}
        </div>
        <TeamCell short={m.away.short} name={m.away.name} won={awayWon} logo={logo(m.away)} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 9, color: 'var(--text-secondary)', display: 'block' }}>{fmtMatchDate(m.date)}</span>
        {(venueTime || myTime) && (
          <span style={{ fontSize: 9, color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>
            {venueTime && <><span style={{ fontWeight: 500 }}>{venueTime}</span> <span style={{ opacity: 0.6 }}>local</span>{myTime && <span style={{ opacity: 0.4 }}> · </span>}</>}
            {myTime && <><span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{myTime}</span> <span style={{ opacity: 0.6 }}>your time</span></>}
          </span>
        )}
        {tourName && <span style={{ fontSize: 8, color: 'var(--text-secondary)', opacity: 0.55, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 156, marginTop: 1 }}>{tourName}</span>}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {watchUrl && (
          <a href={watchUrl} target="_blank" rel="noopener noreferrer" title="Watch live" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', background: 'rgba(0,58,208,0.1)', padding: '4px 10px', borderRadius: 10 }}>
            <Clapperboard size={11} strokeWidth={2.5} />{!isResult && <span>Watch</span>}
          </a>
        )}
        {moreUrl && (
          <a href={moreUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', textDecoration: 'none', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 10 }}>More →</a>
        )}
      </div>
    </div>
  )
}

function normKey(date: string, home: string, away: string, gender: string) {
  return `${date.slice(0, 10)}|${home.toUpperCase()}|${away.toUpperCase()}|${gender}`
}
function normFIH(m: FIHMatch): NormMatch {
  return { key: normKey(m.date, m.home.short, m.away.short, m.gender), date: m.date, gender: m.gender, status: m.status, home: { ...m.home }, away: { ...m.away }, tourName: m.tourName, watchUrl: null, moreUrl: fihMatchUrl(m), venueTime: m.venueTime ?? null }
}
function normPro(m: ProLeagueMatch): NormMatch {
  return { key: normKey(m.date, m.home.short, m.away.short, m.gender), date: m.date, gender: m.gender as 'M' | 'F', status: m.status as NormMatch['status'], home: { ...m.home }, away: { ...m.away }, tourName: 'FIH Pro League', watchUrl: m.watchLiveUrl }
}
function normEuro(m: EuroMatch): NormMatch {
  return { key: normKey(m.date, m.home.code, m.away.code, m.gender), date: m.date, gender: m.gender, status: m.status as NormMatch['status'], home: { name: m.home.name, short: m.home.code, score: m.home.score, logo: m.home.logo }, away: { name: m.away.name, short: m.away.code, score: m.away.score, logo: m.away.logo }, tourName: m.tournamentName, watchUrl: m.watchUrl || null, eventUrl: m.eventUrl || null }
}
function normWC(m: WCMatch): NormMatch {
  return { key: normKey(m.date, m.home.short, m.away.short, m.gender), date: m.date, gender: m.gender, status: m.status, home: { ...m.home }, away: { ...m.away }, tourName: 'WC 2026', pool: m.pool || null, venueTime: m.venueTime, moreUrl: 'https://www.fih.hockey/events/fih-hockey-worldcup-belgium-netherlands-2026/schedule-fixtures-results' }
}

function CombinedMatchCard({ match: m, isResult }: { match: NormMatch; isResult: boolean }) {
  const homeWon    = isResult && m.home.score !== null && m.away.score !== null && m.home.score > m.away.score
  const awayWon    = isResult && m.home.score !== null && m.away.score !== null && m.away.score > m.home.score
  const isLive     = m.status === 'live'
  const genderColor = m.gender === 'M' ? '#003ad0' : '#e0336c'
  const venueTime  = m.venueTime ?? null
  const myTime     = fmtLocalTime(m.date)
  return (
    <div style={{ flexShrink: 0, width: 184, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: `3px solid ${genderColor}`, padding: '11px 12px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {m.pool && <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', opacity: 0.7, letterSpacing: 0.5, textTransform: 'uppercase' }}>{m.pool}</span>}
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 4 }}>
        <TeamCell short={m.home.short} name={m.home.name} won={homeWon} logo={m.home.logo} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, minWidth: 44, gap: 4 }}>
          {isLive
            ? <span style={{ fontSize: 9, fontWeight: 800, color: '#e33', letterSpacing: 1 }}>● LIVE</span>
            : isResult && m.eventUrl
              ? <a href={m.eventUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', background: 'rgba(0,58,208,0.1)', padding: '3px 8px', borderRadius: 8, whiteSpace: 'nowrap' }}>Results →</a>
              : isResult && m.home.score !== null && m.away.score !== null
                ? <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1 }}>{m.home.score}-{m.away.score}</span>
                : <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>vs</span>
          }
          {isResult && !isLive && !m.eventUrl && <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>FT</span>}
        </div>
        <TeamCell short={m.away.short} name={m.away.name} won={awayWon} logo={m.away.logo} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 9, color: 'var(--text-secondary)', display: 'block' }}>{fmtMatchDate(m.date)}</span>
        {(venueTime || myTime) && (
          <span style={{ fontSize: 9, color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>
            {venueTime && <><span style={{ fontWeight: 500 }}>{venueTime}</span> <span style={{ opacity: 0.6 }}>local</span>{myTime && <span style={{ opacity: 0.4 }}> · </span>}</>}
            {myTime && <><span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{myTime}</span> <span style={{ opacity: 0.6 }}>your time</span></>}
          </span>
        )}
        {m.tourName && <span style={{ fontSize: 8, color: 'var(--text-secondary)', opacity: 0.55, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 156, marginTop: 1 }}>{m.tourName}</span>}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {m.eventUrl && <a href={m.eventUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', background: 'rgba(0,58,208,0.1)', padding: '4px 10px', borderRadius: 10 }}>Info →</a>}
        {m.watchUrl && <a href={m.watchUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', textDecoration: 'none', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 10 }}><Clapperboard size={11} strokeWidth={2.5} /> {!isResult && <span>Watch</span>}</a>}
        {m.moreUrl && <a href={m.moreUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', background: 'rgba(0,58,208,0.1)', padding: '4px 10px', borderRadius: 10 }}>Info →</a>}
      </div>
    </div>
  )
}

function WCMatchCard({ match: m, isResult }: { match: WCMatch; isResult: boolean }) {
  const homeWon = isResult && m.home.score !== null && m.away.score !== null && m.home.score > m.away.score
  const awayWon = isResult && m.home.score !== null && m.away.score !== null && m.away.score > m.home.score
  const isLive  = m.status === 'live'
  const genderColor = m.gender === 'M' ? '#003ad0' : '#e0336c'
  const myTime  = fmtLocalTime(m.date)
  return (
    <div style={{ flexShrink: 0, width: 184, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: `3px solid ${genderColor}`, padding: '11px 12px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
      {m.pool && <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', opacity: 0.7, letterSpacing: 0.5, textTransform: 'uppercase' }}>{m.pool}</span>}
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 4 }}>
        <TeamCell short={m.home.short} name={m.home.name} won={homeWon} logo={null} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, minWidth: 44 }}>
          {isLive ? <span style={{ fontSize: 9, fontWeight: 800, color: '#e33', letterSpacing: 1 }}>● LIVE</span>
            : isResult && m.home.score !== null && m.away.score !== null
              ? <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1 }}>{m.home.score}-{m.away.score}</span>
              : <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>vs</span>
          }
          {isResult && !isLive && <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>FT</span>}
        </div>
        <TeamCell short={m.away.short} name={m.away.name} won={awayWon} logo={null} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 9, color: 'var(--text-secondary)', display: 'block' }}>{fmtMatchDate(m.date)}</span>
        {(m.venueTime || myTime) && (
          <span style={{ fontSize: 9, color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>
            {m.venueTime && <><span style={{ fontWeight: 500 }}>{m.venueTime}</span> <span style={{ opacity: 0.6 }}>local</span>{myTime && <span style={{ opacity: 0.4 }}> · </span>}</>}
            {myTime && <><span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{myTime}</span> <span style={{ opacity: 0.6 }}>your time</span></>}
          </span>
        )}
      </div>
    </div>
  )
}

/* ─── NL Match card ──────────────────────────────────────────────────────── */

function NLMatchCard({ match: m, isResult, gender }: { match: Match; isResult: boolean; gender: 'men' | 'women' }) {
  const homeWon = isResult && m.score ? m.score.home > m.score.away : false
  const awayWon = isResult && m.score ? m.score.away > m.score.home : false
  const gColor = gender === 'men' ? '#003ad0' : '#e0336c'
  const leagueLabel = gender === 'men' ? 'Hoofdklasse Heren' : 'Hoofdklasse Dames'
  return (
    <div style={{ flexShrink: 0, width: 184, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: `3px solid ${gColor}`, padding: '11px 12px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 160 }}>{leagueLabel}</span>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 4 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 0 }}>
          <TeamLogo logo={m.home.logo} name={m.home.name} />
          <span style={{ fontSize: 10, fontWeight: homeWon ? 800 : 400, color: homeWon ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 64 }}>{m.home.name}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, minWidth: 44 }}>
          {isResult && m.score
            ? <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1 }}>{m.score.home}-{m.score.away}</span>
            : <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>vs</span>
          }
          {isResult && m.score && <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>FT</span>}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 0 }}>
          <TeamLogo logo={m.away.logo} name={m.away.name} />
          <span style={{ fontSize: 10, fontWeight: awayWon ? 800 : 400, color: awayWon ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 64 }}>{m.away.name}</span>
        </div>
      </div>
      <span style={{ fontSize: 9, color: 'var(--text-secondary)', display: 'block' }}>{fmtMatchDate(m.date)}</span>
    </div>
  )
}

/* ─── Exported Carousels ─────────────────────────────────────────────────── */

export function ComingUpCarousel({ fihData, proLeagueData, euroData }: { fihData: FIHData | null; proLeagueData: ProLeagueData | null; euroData: EuroData | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [gender, setGender] = useState<'all' | 'M' | 'F'>('all')
  const [tab, setTab]       = useState<'upcoming' | 'results'>('upcoming')
  const scroll = (d: 'left' | 'right') => ref.current?.scrollBy({ left: d === 'left' ? -200 : 200, behavior: 'smooth' })

  const all = useMemo(() => {
    const combined: NormMatch[] = []
    if (fihData) {
      combined.push(...fihData.men.recent.map(normFIH), ...fihData.men.upcoming.map(normFIH))
      combined.push(...fihData.women.recent.map(normFIH), ...fihData.women.upcoming.map(normFIH))
    }
    if (proLeagueData) {
      combined.push(...proLeagueData.men.recent.map(normPro), ...proLeagueData.men.upcoming.map(normPro))
      combined.push(...proLeagueData.women.recent.map(normPro), ...proLeagueData.women.upcoming.map(normPro))
    }
    if (euroData) combined.push(...euroData.matches.map(normEuro))
    const seen = new Set<string>()
    return combined.filter(m => { if (seen.has(m.key)) return false; seen.add(m.key); return true })
  }, [fihData, proLeagueData, euroData])

  const isLoaded = fihData !== null || proLeagueData !== null || euroData !== null
  const filtered = all.filter(m => {
    if (gender !== 'all' && m.gender !== gender) return false
    if (tab === 'upcoming') return m.status === 'live' || (m.status === 'upcoming' && notPast(m.date))
    return m.status === 'completed'
  }).sort((a, b) =>
    tab === 'upcoming'
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div style={{ marginBottom: 48, background: 'var(--bg-card)', borderRadius: '0 0 12px 12px', border: '1px solid var(--border)', borderTop: 'none', padding: '14px 24px 0' }}>
      <CarouselHeader title="⚡ Coming Up" href="https://www.fih.hockey/schedule-fixtures-results" hrefLabel="FIH"
        controls={
          <div style={{ display: 'flex', gap: 6 }}>
            <TabPill active={gender === 'all'} onClick={() => setGender('all')} label="All" />
            <TabPill active={gender === 'M'}   onClick={() => setGender('M')}   label="Men" />
            <TabPill active={gender === 'F'}   onClick={() => setGender('F')}   label="Women" />
            <TabPill active={tab === 'upcoming'} onClick={() => setTab('upcoming')} label="Upcoming" />
            <ScrollBtn dir="left"  onClick={() => scroll('left')}  />
            <ScrollBtn dir="right" onClick={() => scroll('right')} />
          </div>
        }
      />
      <div ref={ref} style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 16, margin: '0 -24px', paddingLeft: 24, paddingRight: 24 }}>
        {!isLoaded
          ? [...Array(7)].map((_, i) => <div key={i} style={{ flexShrink: 0, width: 184, height: 120, borderRadius: 8, background: 'var(--border)', opacity: 0.4 }} />)
          : filtered.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '20px 0' }}>No {tab === 'results' ? 'results' : 'upcoming matches'}</p>
            : filtered.map(m => <CombinedMatchCard key={m.key} match={m} isResult={tab === 'results'} />)
        }
      </div>
    </div>
  )
}

export function FIHCombinedCarousel({ fihData, proLeagueData, wcData }: { fihData: FIHData | null; proLeagueData: ProLeagueData | null; wcData: WCData | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [gender, setGender] = useState<'M' | 'F' | 'all'>('all')
  const [tab,    setTab]    = useState<'recent' | 'upcoming'>('upcoming')
  const [source, setSource] = useState<'all' | 'intl' | 'pro' | 'wc'>('all')
  const scroll = (d: 'left' | 'right') => ref.current?.scrollBy({ left: d === 'left' ? -200 : 200, behavior: 'smooth' })

  const byDateDesc = (a: NormMatch, b: NormMatch) => new Date(b.date).getTime() - new Date(a.date).getTime()
  const byDateAsc  = (a: NormMatch, b: NormMatch) => new Date(a.date).getTime() - new Date(b.date).getTime()

  const intlRecent   = fihData       ? [...fihData.men.recent,           ...fihData.women.recent]          .map(normFIH).sort(byDateDesc) : []
  const intlUpcoming = fihData       ? [...fihData.men.upcoming,         ...fihData.women.upcoming]        .map(normFIH).filter(m => notPast(m.date)).sort(byDateAsc) : []
  const proRecent    = proLeagueData ? [...proLeagueData.men.recent,     ...proLeagueData.women.recent]    .map(normPro).sort(byDateDesc) : []
  const proUpcoming  = proLeagueData ? [...proLeagueData.men.upcoming,   ...proLeagueData.women.upcoming]  .map(normPro).filter(m => notPast(m.date)).sort(byDateAsc) : []
  const wcRecent     = wcData        ? [...wcData.men.recent,            ...wcData.women.recent]           .map(normWC).sort(byDateDesc) : []
  const wcUpcoming   = wcData        ? [...wcData.men.upcoming,          ...wcData.women.upcoming]         .map(normWC).filter(m => notPast(m.date)).sort(byDateAsc) : []

  const pool: NormMatch[] = tab === 'recent'
    ? source === 'intl' ? intlRecent  : source === 'pro' ? proRecent  : source === 'wc' ? wcRecent  : [...intlRecent,   ...proRecent,   ...wcRecent].sort(byDateDesc)
    : source === 'intl' ? intlUpcoming : source === 'pro' ? proUpcoming : source === 'wc' ? wcUpcoming : [...intlUpcoming, ...proUpcoming, ...wcUpcoming].sort(byDateAsc)

  const matches = gender === 'all' ? pool : pool.filter(m => m.gender === gender)

  return (
    <div style={{ marginBottom: 40 }}>
      <CarouselHeader title="🌍 FIH International" href="https://www.fih.hockey/schedule-fixtures-results" hrefLabel="FIH"
        controls={
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <TabPill active={source === 'all'}  onClick={() => setSource('all')}  label="All" />
            <TabPill active={source === 'intl'} onClick={() => setSource('intl')} label="Intl" />
            <TabPill active={source === 'pro'}  onClick={() => setSource('pro')}  label="Pro League" />
            <TabPill active={source === 'wc'}   onClick={() => setSource('wc')}   label="World Cup" />
            <TabPill active={gender === 'all'} onClick={() => setGender('all')} label="Men+Women" />
            <TabPill active={gender === 'M'}   onClick={() => setGender('M')}   label="Men" />
            <TabPill active={gender === 'F'}   onClick={() => setGender('F')}   label="Women" />
            <ScrollBtn dir="left"  onClick={() => scroll('left')}  />
            <ScrollBtn dir="right" onClick={() => scroll('right')} />
          </div>
        }
      />
      <div ref={ref} style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {(!fihData && !proLeagueData && !wcData)
          ? [...Array(7)].map((_, i) => <div key={i} style={{ flexShrink: 0, width: 176, height: 120, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', opacity: 0.5 }} />)
          : matches.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '20px 0' }}>No {tab === 'recent' ? 'results' : 'upcoming matches'}</p>
            : matches.map((m, i) => <CombinedMatchCard key={i} match={m} isResult={tab === 'recent'} />)
        }
      </div>
    </div>
  )
}

export function EuroHockeyCarousel({ data }: { data: EuroData | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [gender, setGender] = useState<'M' | 'F' | 'all'>('all')
  const [tab, setTab]       = useState<'matches' | 'tournaments'>('matches')
  const scroll = (d: 'left' | 'right') => ref.current?.scrollBy({ left: d === 'left' ? -200 : 200, behavior: 'smooth' })

  const matches     = data?.matches ?? []
  const tournaments = data?.tournaments ?? []
  const filtMatches = (gender === 'all' ? matches : matches.filter(m => m.gender === gender)).filter(m => m.status !== 'completed')
  const filtTours   = gender === 'all' ? tournaments : tournaments.filter(t => t.gender === gender)

  function fmtDateRange(start: string, end: string) {
    const s = new Date(start), e = new Date(end)
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth())
      return `${s.getDate()}–${e.toLocaleDateString('en-GB', opts)}`
    return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', opts)}`
  }

  return (
    <div style={{ marginBottom: 40 }}>
      <CarouselHeader title="🇪🇺 EuroHockey" href="https://eurohockey.org/calendar" hrefLabel="Calendar"
        controls={
          <div style={{ display: 'flex', gap: 6 }}>
            <TabPill active={tab === 'matches'}     onClick={() => setTab('matches')}     label="Matches" />
            <TabPill active={tab === 'tournaments'} onClick={() => setTab('tournaments')} label="Tournaments" />
            <TabPill active={gender === 'all'} onClick={() => setGender('all')} label="All" />
            <TabPill active={gender === 'M'}   onClick={() => setGender('M')}   label="Men" />
            <TabPill active={gender === 'F'}   onClick={() => setGender('F')}   label="Women" />
            <ScrollBtn dir="left"  onClick={() => scroll('left')}  />
            <ScrollBtn dir="right" onClick={() => scroll('right')} />
          </div>
        }
      />
      <div ref={ref} style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {!data
          ? [...Array(5)].map((_, i) => <div key={i} style={{ flexShrink: 0, width: 184, height: 130, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', opacity: 0.5 }} />)
          : tab === 'matches'
            ? filtMatches.length === 0
                ? <p style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '20px 0' }}>No matches found</p>
                : filtMatches.map(m => (
                    <div key={m.id} style={{ flexShrink: 0, width: 184, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: `3px solid ${m.gender === 'M' ? '#003ad0' : '#e0336c'}`, padding: '7px 12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', opacity: 0.6, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{m.tournamentName}</span>
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 4 }}>
                        <TeamCell short={m.home.code} name={m.home.name} won={m.status === 'completed' && (m.home.score ?? 0) > (m.away.score ?? 0)} logo={m.home.logo} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, minWidth: 44 }}>
                          {m.status === 'completed' && m.home.score !== null && m.away.score !== null
                            ? <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1 }}>{m.home.score}-{m.away.score}</span>
                            : <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>vs</span>
                          }
                          {m.status === 'completed' && <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>FT</span>}
                        </div>
                        <TeamCell short={m.away.code} name={m.away.name} won={m.status === 'completed' && (m.away.score ?? 0) > (m.home.score ?? 0)} logo={m.away.logo} />
                      </div>
                      <span style={{ fontSize: 9, color: 'var(--text-secondary)', display: 'block' }}>{m.date ? fmtMatchDate(m.date) : ''}</span>
                      {m.date && fmtLocalTime(m.date) && <span style={{ fontSize: 9, color: 'var(--text-secondary)', display: 'block' }}>{fmtLocalTime(m.date)} <span style={{ opacity: 0.65 }}>your time</span></span>}
                      <div style={{ display: 'flex', gap: 5 }}>
                        <a href={m.eventUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 8, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', background: 'rgba(0,58,208,0.1)', padding: '3px 8px', borderRadius: 6 }}>Info →</a>
                        <a href={m.watchUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', textDecoration: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 6 }}>Watch →</a>
                      </div>
                    </div>
                  ))
            : filtTours.length === 0
                ? <p style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '20px 0' }}>No upcoming tournaments</p>
                : filtTours.map(e => (
                    <div key={e.id} style={{ flexShrink: 0, width: 196, borderRadius: 8, background: e.status === 'ongoing' ? 'rgba(255,160,50,0.08)' : 'var(--bg-card)', border: `1px solid ${e.status === 'ongoing' ? 'rgba(255,160,50,0.35)' : 'var(--border)'}`, padding: '14px 14px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {e.status === 'ongoing' && <span style={{ fontSize: 8, fontWeight: 800, color: '#e07000', letterSpacing: 1.5, textTransform: 'uppercase' }}>● Live now</span>}
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{e.gender === 'M' ? '♂ Men' : '♀ Women'} · {e.location}</span>
                      <span style={{ fontSize: 9, color: 'var(--text-secondary)', opacity: 0.7 }}>{fmtDateRange(e.startDate, e.endDate)}</span>
                      <div style={{ display: 'flex', gap: 5, marginTop: 2 }}>
                        <a href={e.eventUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', fontSize: 9, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', background: 'rgba(0,58,208,0.1)', padding: '4px 0', borderRadius: 8 }}>Info →</a>
                        <a href={e.watchUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', textDecoration: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: '4px 0', borderRadius: 8 }}>Watch →</a>
                      </div>
                    </div>
                  ))
        }
      </div>
    </div>
  )
}

export function NLLeagueCarousel({ menData, womenData }: { menData: MatchData | null; womenData: MatchData | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [gender, setGender] = useState<'all' | 'men' | 'women'>('all')
  const [tab, setTab]       = useState<'results' | 'upcoming'>('upcoming')
  const scroll = (d: 'left' | 'right') => ref.current?.scrollBy({ left: d === 'left' ? -200 : 200, behavior: 'smooth' })

  type Tagged = Match & { _gender: 'men' | 'women' }
  const tag = (ms: Match[], g: 'men' | 'women'): Tagged[] => ms.map(m => ({ ...m, _gender: g }))
  const allResults  = [...tag(menData?.results ?? [], 'men'),  ...tag(womenData?.results ?? [], 'women')] .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const allUpcoming = [...tag(menData?.upcoming ?? [], 'men'), ...tag(womenData?.upcoming ?? [], 'women')].filter(m => notPast(m.date)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const gData   = gender === 'all' ? null : gender === 'men' ? menData : womenData
  const matches: Tagged[] = gender === 'all'
    ? (tab === 'results' ? allResults : allUpcoming)
    : tag(gData ? (tab === 'results' ? gData.results : gData.upcoming) : [], gender as 'men' | 'women')

  return (
    <div style={{ marginBottom: 40 }}>
      <CarouselHeader title="🇳🇱 Netherlands Hoofdklasse" href="/competition" hrefLabel="All"
        controls={
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <TabPill active={gender === 'all'}   onClick={() => setGender('all')}   label="All" />
            <TabPill active={gender === 'men'}   onClick={() => setGender('men')}   label="Men" />
            <TabPill active={gender === 'women'} onClick={() => setGender('women')} label="Women" />
            <TabPill active={tab === 'upcoming'} onClick={() => setTab('upcoming')} label="Upcoming" />
            <ScrollBtn dir="left"  onClick={() => scroll('left')}  />
            <ScrollBtn dir="right" onClick={() => scroll('right')} />
          </div>
        }
      />
      <div ref={ref} style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {!menData && !womenData
          ? [...Array(6)].map((_, i) => <div key={i} style={{ flexShrink: 0, width: 184, height: 120, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', opacity: 0.5 }} />)
          : matches.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '20px 0' }}>No {tab === 'results' ? 'results' : 'upcoming matches'}</p>
            : matches.map(m => <NLMatchCard key={m.id} match={m} gender={m._gender} isResult={tab === 'results'} />)
        }
      </div>
    </div>
  )
}
