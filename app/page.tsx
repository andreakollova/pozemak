'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import { getArticles, Article, getVideos, Video, getTitle, getText, getSlug, getVideoTitle, getArticleSource } from '@/lib/supabase'
import { Play, ChevronLeft, ChevronRight, Clock, Clapperboard } from 'lucide-react'
import type { Match, Poule } from '@/lib/hockey-api'

/* ─── FIH / EuroHockey types ─────────────────────────────────────────────── */
interface FIHMatch {
  date: string; gender: 'M' | 'F'; status: 'upcoming' | 'live' | 'completed' | 'cancelled'
  home: { name: string; short: string; score: number | null }
  away: { name: string; short: string; score: number | null }
  venue: string; tourName: string
  game_id: string; sr_game_id: string; series_id: string
  venueTime?: string | null
}
interface FIHGenderData { recent: FIHMatch[]; upcoming: FIHMatch[] }
interface FIHData { men: FIHGenderData; women: FIHGenderData }

interface ProLeagueMatch {
  date: string; gender: 'M' | 'F'; status: string
  home: { name: string; short: string; score: number | null }
  away: { name: string; short: string; score: number | null }
  venue: string; watchLiveUrl: string | null
}
interface ProLeagueGenderData { recent: ProLeagueMatch[]; upcoming: ProLeagueMatch[] }
interface ProLeagueData { men: ProLeagueGenderData; women: ProLeagueGenderData; watchLiveUrl: string | null }

interface EuroEvent {
  id: string; name: string; gender: 'M' | 'F'; startDate: string; endDate: string
  location: string; status: 'upcoming' | 'ongoing' | 'completed'
  eventUrl: string; watchUrl: string
}
interface EuroMatch {
  id: string; tournamentName: string; gender: 'M' | 'F'; date: string
  status: 'upcoming' | 'live' | 'completed'
  home: { name: string; code: string; logo: string | null; score: number | null }
  away: { name: string; code: string; logo: string | null; score: number | null }
  location: string; eventUrl: string; watchUrl: string
}
interface EuroData { matches: EuroMatch[]; tournaments: EuroEvent[] }

/* ─── Country short-code → flag emoji ───────────────────────────────────── */
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
function flag(short: string) { return FLAG[short?.toUpperCase()] ?? '' }

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

/**
 * Match date in the viewer's local timezone.
 * FIH stores times in IST (+05:30) so we must use new Date() — do not extract
 * the date string directly from ISO as that would give the IST date, not local date.
 */
function fmtMatchDate(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Match time in the viewer's local timezone (equivalent to FIH "local time" toggle).
 * Returns null when the ISO string has no tz offset and can't be reliably converted.
 */
function fmtLocalTime(iso: string): string | null {
  if (!iso.match(/T\d{2}:\d{2}/)) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// Kept as alias so existing call-sites don't break — venue time can't be shown
// correctly since FIH stores all times in IST, not the venue's local timezone.
const fmtVenueTime = (_iso: string) => null

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

function getMatches(d: { poules?: Poule[]; matches?: Match[] }): Match[] {
  if (d.poules?.length) return d.poules.flatMap(p => p.matches)
  return d.matches ?? []
}

function getRecentResults(matches: Match[], limit = 5): Match[] {
  return matches.filter(m => m.status === 'final' && m.score)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

function getUpcomingMatches(matches: Match[], limit = 5): Match[] {
  return matches.filter(m => m.status !== 'final' && m.status !== 'live')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit)
}

interface CountryCfg { flag: string; name: string; href: string }

const COUNTRIES: CountryCfg[] = [
  { flag: '🇳🇱', name: 'Netherlands',   href: '/netherlands'   },
  { flag: '🇬🇧', name: 'Great Britain', href: '/great-britain' },
  { flag: '🇦🇺', name: 'Australia',     href: '/australia'     },
  { flag: '🇩🇪', name: 'Germany',       href: '/germany'       },
  { flag: '🇧🇪', name: 'Belgium',       href: '/belgium'       },
  { flag: '🇪🇸', name: 'Spain',         href: '/spain'         },
  { flag: '🇦🇷', name: 'Argentina',     href: '/argentina'     },
  { flag: '🇮🇪', name: 'Ireland',       href: '/ireland'       },
  { flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', name: 'Scotland',     href: '/scotland'      },
  { flag: '🇮🇳', name: 'India',         href: '/india'         },
]

interface MatchData { name: string; results: Match[]; upcoming: Match[]; gender: 'men' | 'women' }

export default function Home() {
  const [articles, setArticles]       = useState<Article[]>([])
  const [damesVideos, setDamesVideos] = useState<Video[]>([])
  const [herenVideos, setHerenVideos] = useState<Video[]>([])
  const [fihVideos,   setFihVideos]   = useState<Video[]>([])
  const [loading, setLoading]         = useState(true)
  const [fihData,       setFihData]       = useState<FIHData | null>(null)
  const [proLeagueData, setProLeagueData] = useState<ProLeagueData | null>(null)
  const [euroData,      setEuroData]      = useState<EuroData | null>(null)
  const [nlMen,         setNlMen]         = useState<MatchData | null>(null)
  const [nlWomen,       setNlWomen]       = useState<MatchData | null>(null)

  useEffect(() => {
    Promise.all([
      getArticles(120),
      getVideos('dames', 10),
      getVideos('heren', 10),
      getVideos('fih', 10),
    ]).then(([arts, dames, heren, fih]) => {
      setArticles(arts)
      setDamesVideos(dames)
      setHerenVideos(heren)
      setFihVideos(fih)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch('/api/fih')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setFihData(d) })
      .catch(() => {})
    fetch('/api/fih-pro-league')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setProLeagueData(d) })
      .catch(() => {})
    fetch('/api/eurohockey')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setEuroData(d) })
      .catch(() => {})
    fetch('/api/hockey?comp=national&id=1')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!d) return; const m = getMatches(d); setNlMen({ name: d.name, results: getRecentResults(m, 20), upcoming: getUpcomingMatches(m, 20), gender: 'men' }) })
      .catch(() => {})
    fetch('/api/hockey?comp=national&id=2')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!d) return; const m = getMatches(d); setNlWomen({ name: d.name, results: getRecentResults(m, 20), upcoming: getUpcomingMatches(m, 20), gender: 'women' }) })
      .catch(() => {})
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const byCountry: Record<string, Article[]> = {}
  for (const a of articles) {
    const { country } = getArticleSource(a)
    if (!byCountry[country]) byCountry[country] = []
    byCountry[country].push(a)
  }

  const hero = articles[0]

  return (
    <>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .page-wrap { max-width: 1200px; margin: 0 auto; padding: 28px 24px 100px; animation: fadeUp .4s ease; }
        .art-row   { display: flex; gap: 14px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
        .art-row::-webkit-scrollbar { display: none; }
        .match-tab { border: none; background: none; cursor: pointer; padding: 7px 16px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; transition: all .15s; }
      `}</style>

      <div className="page-wrap">

        {hero && <HeroCard article={hero} />}

        {/* ── Coming Up — right below main banner ── */}
        <ComingUpCarousel fihData={fihData} proLeagueData={proLeagueData} euroData={euroData} />

        {/* Trending News — article[1] featured + articles[2–5] most viewed */}
        {articles.length > 1 && <TrendingSection articles={articles.slice(1, 6)} />}

        {/* ── Individual match carousels ── */}
        <FIHIntlCarousel data={fihData} />
        <FIHProLeagueCarousel data={proLeagueData} />
        <EuroHockeyCarousel data={euroData} />

        {/* 🇳🇱 Netherlands — carousel + league */}
        {(byCountry['Netherlands']?.length ?? 0) > 0 && (
          <Grid3Section cfg={COUNTRIES.find(c => c.name === 'Netherlands')!} articles={byCountry['Netherlands'].slice(0, 10)} />
        )}
        <NLLeagueCarousel menData={nlMen} womenData={nlWomen} />

        {/* Articles — GB + AU/DE */}
        <div style={{ marginBottom: 56, display: 'flex', flexDirection: 'column', gap: 40 }}>
          {(byCountry['Great Britain']?.length ?? 0) > 0 && (
            <Grid3Section cfg={COUNTRIES.find(c => c.name === 'Great Britain')!} articles={byCountry['Great Britain'].slice(0, 10)} noMargin />
          )}
          {((byCountry['Belgium']?.length ?? 0) > 0 || (byCountry['Germany']?.length ?? 0) > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, minWidth: 0 }}>
              {(byCountry['Belgium']?.length ?? 0) > 0 && (
                <div style={{ minWidth: 0 }}><ScrollSection cfg={COUNTRIES.find(c => c.name === 'Belgium')!} articles={byCountry['Belgium'].slice(0, 5)} cardHeight={140} /></div>
              )}
              {(byCountry['Germany']?.length ?? 0) > 0 && (
                <div style={{ minWidth: 0 }}><ScrollSection cfg={COUNTRIES.find(c => c.name === 'Germany')!} articles={byCountry['Germany'].slice(0, 5)} cardHeight={140} /></div>
              )}
            </div>
          )}
        </div>

        {/* 🇦🇷 Argentina — full width */}
        {(byCountry['Argentina']?.length ?? 0) > 0 && (
          <Grid3Section cfg={COUNTRIES.find(c => c.name === 'Argentina')!} articles={byCountry['Argentina'].slice(0, 10)} />
        )}

        {/* 🇮🇳 India + 🇦🇺 Australia — side by side */}
        {((byCountry['India']?.length ?? 0) > 0 || (byCountry['Australia']?.length ?? 0) > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 56, minWidth: 0 }}>
            {(byCountry['India']?.length ?? 0) > 0 && (
              <div style={{ minWidth: 0 }}><ScrollSection cfg={COUNTRIES.find(c => c.name === 'India')!} articles={byCountry['India'].slice(0, 6)} cardHeight={130} /></div>
            )}
            {(byCountry['Australia']?.length ?? 0) > 0 && (
              <div style={{ minWidth: 0 }}><ScrollSection cfg={COUNTRIES.find(c => c.name === 'Australia')!} articles={byCountry['Australia'].slice(0, 6)} cardHeight={130} /></div>
            )}
          </div>
        )}

        {/* 🇪🇸 Spain — full width */}
        {(byCountry['Spain']?.length ?? 0) > 0 && (
          <Grid3Section cfg={COUNTRIES.find(c => c.name === 'Spain')!} articles={byCountry['Spain'].slice(0, 10)} />
        )}

        {/* 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland + 🇮🇪 Ireland — side by side */}
        {((byCountry['Scotland']?.length ?? 0) > 0 || (byCountry['Ireland']?.length ?? 0) > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 56, minWidth: 0 }}>
            {(byCountry['Scotland']?.length ?? 0) > 0 && (
              <div style={{ minWidth: 0 }}><ScrollSection cfg={COUNTRIES.find(c => c.name === 'Scotland')!} articles={byCountry['Scotland'].slice(0, 6)} cardHeight={130} /></div>
            )}
            {(byCountry['Ireland']?.length ?? 0) > 0 && (
              <div style={{ minWidth: 0 }}><ScrollSection cfg={COUNTRIES.find(c => c.name === 'Ireland')!} articles={byCountry['Ireland'].slice(0, 6)} cardHeight={130} /></div>
            )}
          </div>
        )}

        {damesVideos.length > 0 && <VideoCarousel label="🏑 Hoofdklasse Dames" videos={damesVideos} />}
        {herenVideos.length > 0  && <VideoCarousel label="🏑 Hoofdklasse Heren" videos={herenVideos} />}
        {fihVideos.length > 0    && <VideoCarousel label="🌍 FIH Hockey" videos={fihVideos} />}
      </div>
    </>
  )
}

/* ─── Shared header ──────────────────────────────────────────────────────── */
function SectionHeader({ cfg, scrollRef }: { cfg: CountryCfg; scrollRef?: React.RefObject<HTMLDivElement | null> }) {
  const scroll = (d: 'left' | 'right') => scrollRef?.current?.scrollBy({ left: d === 'left' ? -260 : 260, behavior: 'smooth' })
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>{cfg.flag}</span>
        <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: 0.3 }}>{cfg.name}</span>
        <div style={{ width: 28, height: 1, background: 'var(--border)' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href={cfg.href} style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', letterSpacing: 1 }}>All →</Link>
        {scrollRef && (['left', 'right'] as const).map(d => (
          <button key={d} onClick={() => scroll(d)} style={{ width: 24, height: 24, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            {d === 'left' ? <ChevronLeft size={10} /> : <ChevronRight size={10} />}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
function HeroCard({ article }: { article: Article }) {
  const [hov, setHov] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)
  const text = (getText(article) || '').slice(0, 200).trim() + '…'
  const source = getArticleSource(article)
  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 0, borderRadius: 12, overflow: 'hidden' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div style={{ position: 'relative', height: 500, overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
        {article.image_url
          ? <img src={article.image_url} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .7s', transform: hov ? 'scale(1.04)' : 'scale(1)' }} />
          : <div style={{ position: 'absolute', inset: 0, background: '#111' }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,58,208,0.92) 0%, rgba(0,58,208,0.55) 32%, transparent 62%)' }} />
        <div style={{ position: 'absolute', top: 24, left: 24, display: 'flex', gap: 8 }}>
          <span style={{ background: 'var(--green)', color: '#003ad0', fontSize: 10, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 6 }}>Top Story</span>
          <span style={{ background: '#003ad0', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '5px 10px', borderRadius: 6 }}>{source.flag} {source.country}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Clock size={11} color="rgba(255,255,255,0.45)" />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>{timeAgo(article.scraped_at)}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 44px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px', color: hov ? 'var(--green)' : '#fff', marginBottom: 14, maxWidth: 760, transition: 'color .2s' }}>{title}</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 620 }}>{text}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 22, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, padding: '8px 20px', fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>Read article →</div>
        </div>
      </div>
    </Link>
  )
}

/* ─── Trending News (after hero) ────────────────────────────────────────── */
function TrendingSection({ articles }: { articles: Article[] }) {
  const featured = articles[0]
  const list = articles.slice(1, 5)
  if (!featured) return null
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: 0.3, color: 'var(--text-primary)' }}>🔥 Trending News</span>
        <div style={{ height: 1, background: 'var(--border)', flex: 1 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 300px)', gap: 16, alignItems: 'stretch' }}>
        <FeaturedCard article={featured} trending />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 0.3, color: 'var(--text-primary)', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>🚀 Most Viewed Stories</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {list.map(a => <ListCard key={a.id} article={a} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── 1. Editorial: big left + stacked list right ────────────────────────── */
function EditorialSection({ cfg, articles }: { cfg: CountryCfg; articles: Article[] }) {
  const featured = articles[0]
  const rest = articles.slice(1, 5)
  return (
    <div style={{ marginBottom: 56 }}>
      <SectionHeader cfg={cfg} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 300px)', gap: 16 }}>
        <FeaturedCard article={featured} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rest.map(a => <ListCard key={a.id} article={a} />)}
        </div>
      </div>
    </div>
  )
}

function FeaturedCard({ article, trending }: { article: Article; trending?: boolean }) {
  const [hov, setHov] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)
  const text = (getText(article) || '').slice(0, 140).trim() + '…'
  const source = getArticleSource(article)
  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ position: 'relative', height: '100%', minHeight: 300, borderRadius: 10, overflow: 'hidden' }}>
        {article.image_url
          ? <img src={article.image_url} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .7s', transform: hov ? 'scale(1.04)' : 'scale(1)' }} />
          : <div style={{ position: 'absolute', inset: 0, background: '#111' }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 55%, transparent 75%)' }} />
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6 }}>
          {trending && <span style={{ background: 'var(--green)', color: '#000', fontSize: 9, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 5 }}>🔥 Trending</span>}
          <span style={{ background: 'var(--accent)', color: '#fff', fontSize: 9, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 5 }}>{source.flag} {source.country}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '22px 22px' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{timeAgo(article.scraped_at)}</div>
          <h2 style={{ fontSize: 'clamp(16px, 2vw, 24px)', fontWeight: 900, lineHeight: 1.2, color: hov ? 'var(--green)' : '#fff', margin: '0 0 10px', transition: 'color .2s' }}>{title}</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>{text}</p>
        </div>
      </div>
    </Link>
  )
}

function ListCard({ article }: { article: Article }) {
  const [hov, setHov] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)
  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ display: 'flex', gap: 12, padding: '11px', borderRadius: 7, border: '1px solid var(--border)', background: hov ? 'var(--bg-card)' : 'transparent', transition: 'all .2s', alignItems: 'stretch' }}>
        <div style={{ width: 76, minHeight: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#111', position: 'relative', alignSelf: 'stretch' }}>
          {article.image_url && <img src={article.image_url} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s', transform: hov ? 'scale(1.08)' : 'scale(1)' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 5 }}>{timeAgo(article.scraped_at)}</div>
          <p style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.4, color: hov ? 'var(--accent)' : 'var(--text-primary)', transition: 'color .2s', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</p>
        </div>
      </div>
    </Link>
  )
}

/* ─── 2. Grid-3 carousel (Great Britain, Spain, Argentina) ──────────────── */
function Grid3Section({ cfg, articles, noMargin }: { cfg: CountryCfg; articles: Article[]; noMargin?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div style={{ marginBottom: noMargin ? 0 : 56 }}>
      <SectionHeader cfg={cfg} scrollRef={ref} />
      <div ref={ref} className="art-row">
        {articles.map(a => <Grid3Card key={a.id} article={a} />)}
      </div>
    </div>
  )
}

function Grid3Card({ article }: { article: Article }) {
  const [hov, setHov] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)
  const text = (getText(article) || '').slice(0, 100).trim() + '…'
  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', flexShrink: 0, width: 340 }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)', transition: 'border-color .2s' }}>
        <div style={{ height: 200, overflow: 'hidden', background: '#111', position: 'relative' }}>
          {article.image_url
            ? <img src={article.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s', transform: hov ? 'scale(1.06)' : 'scale(1)' }} />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#0d0d0d,#1a1a1a)' }} />
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)' }} />
        </div>
        <div style={{ padding: '14px 16px 18px' }}>
          <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 8 }}>{timeAgo(article.scraped_at)}</div>
          <p style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.4, color: hov ? 'var(--accent)' : 'var(--text-primary)', transition: 'color .2s', margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{text}</p>
        </div>
      </div>
    </Link>
  )
}

/* ─── 3. Horizontal scroll (Australia, Germany, Spain, Argentina, Scotland, India) */
function ScrollSection({ cfg, articles, cardHeight }: { cfg: CountryCfg; articles: Article[]; cardHeight: number }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div>
      <SectionHeader cfg={cfg} scrollRef={ref} />
      <div ref={ref} className="art-row">
        {articles.map(a => <MiniCard key={a.id} article={a} height={cardHeight} />)}
      </div>
    </div>
  )
}

function MiniCard({ article, height }: { article: Article; height: number }) {
  const [hov, setHov] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)
  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', flexShrink: 0, width: 190 }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)', transition: 'border-color .2s' }}>
        <div style={{ height, overflow: 'hidden', background: '#111' }}>
          {article.image_url && <img src={article.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s', transform: hov ? 'scale(1.06)' : 'scale(1)' }} />}
        </div>
        <div style={{ padding: '10px 12px 13px' }}>
          <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 5 }}>{timeAgo(article.scraped_at)}</div>
          <p style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.4, color: hov ? 'var(--accent)' : 'var(--text-primary)', transition: 'color .2s', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>{title}</p>
        </div>
      </div>
    </Link>
  )
}

/* ─── 4. Compact list rows (Belgium) ────────────────────────────────────── */
function CompactListSection({ cfg, articles, noMargin }: { cfg: CountryCfg; articles: Article[]; noMargin?: boolean }) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : 56 }}>
      <SectionHeader cfg={cfg} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {articles.map(a => <CompactRow key={a.id} article={a} />)}
      </div>
    </div>
  )
}

function CompactRow({ article }: { article: Article }) {
  const [hov, setHov] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)
  const text = (getText(article) || '').slice(0, 90).trim() + '…'
  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ display: 'flex', gap: 16, padding: '14px 16px', borderRadius: 7, border: '1px solid var(--border)', background: hov ? 'var(--bg-card)' : 'transparent', transition: 'all .2s', alignItems: 'center' }}>
        <div style={{ width: 100, height: 68, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#111' }}>
          {article.image_url && <img src={article.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s', transform: hov ? 'scale(1.07)' : 'scale(1)' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 6 }}>{timeAgo(article.scraped_at)}</div>
          <p style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.4, color: hov ? 'var(--accent)' : 'var(--text-primary)', transition: 'color .2s', margin: '0 0 5px' }}>{title}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{text}</p>
        </div>
      </div>
    </Link>
  )
}

/* ─── 5. Grid-2: 2 large cards (Ireland) ────────────────────────────────── */
function Grid2Section({ cfg, articles }: { cfg: CountryCfg; articles: Article[] }) {
  return (
    <div style={{ marginBottom: 56 }}>
      <SectionHeader cfg={cfg} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {articles.map(a => <Grid2Card key={a.id} article={a} />)}
      </div>
    </div>
  )
}

function Grid2Card({ article }: { article: Article }) {
  const [hov, setHov] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)
  const text = (getText(article) || '').slice(0, 120).trim() + '…'
  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ position: 'relative', height: 280, borderRadius: 10, overflow: 'hidden' }}>
        {article.image_url
          ? <img src={article.image_url} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .6s', transform: hov ? 'scale(1.05)' : 'scale(1)' }} />
          : <div style={{ position: 'absolute', inset: 0, background: '#111' }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, transparent 80%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '18px 20px' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 7 }}>{timeAgo(article.scraped_at)}</div>
          <p style={{ fontSize: 14, fontWeight: 900, lineHeight: 1.3, color: hov ? 'var(--green)' : '#fff', transition: 'color .2s', margin: '0 0 7px' }}>{title}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{text}</p>
        </div>
      </div>
    </Link>
  )
}

/* ─── Full-width carousels ───────────────────────────────────────────────── */

function CarouselHeader({ title, href, hrefLabel, controls }: { title: string; href: string; hrefLabel: string; controls: React.ReactNode }) {
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

function TabPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{ padding: '5px 13px', border: 'none', borderRadius: 20, background: active ? 'var(--accent)' : 'var(--bg-card)', color: active ? '#fff' : 'var(--text-secondary)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s' }}>
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
              ? <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1 }}>{m.home.score}–{m.away.score}</span>
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
            <Clapperboard size={11} strokeWidth={2.5} />
            {!isResult && <span>Watch</span>}
          </a>
        )}
        {moreUrl && (
          <a href={moreUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', textDecoration: 'none', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 10 }}>
            More →
          </a>
        )}
      </div>
    </div>
  )
}

/* ─── Combined "Coming Up" carousel ─────────────────────────────────────── */
interface NormMatch {
  key: string
  date: string
  gender: 'M' | 'F'
  status: 'upcoming' | 'live' | 'completed' | 'cancelled'
  home: { name: string; short: string; score: number | null; logo?: string | null }
  away: { name: string; short: string; score: number | null; logo?: string | null }
  tourName: string
  watchUrl?: string | null
  moreUrl?: string | null
  eventUrl?: string | null
  venueTime?: string | null
}

function normKey(date: string, home: string, away: string, gender: string) {
  return `${date.slice(0, 10)}|${home.toUpperCase()}|${away.toUpperCase()}|${gender}`
}

function normFIH(m: FIHMatch): NormMatch {
  return {
    key: normKey(m.date, m.home.short, m.away.short, m.gender),
    date: m.date, gender: m.gender, status: m.status,
    home: { ...m.home }, away: { ...m.away },
    tourName: m.tourName, watchUrl: null, moreUrl: fihMatchUrl(m),
    venueTime: m.venueTime ?? null,
  }
}

function normPro(m: ProLeagueMatch): NormMatch {
  return {
    key: normKey(m.date, m.home.short, m.away.short, m.gender),
    date: m.date, gender: m.gender as 'M' | 'F',
    status: m.status as NormMatch['status'],
    home: { ...m.home }, away: { ...m.away },
    tourName: 'FIH Pro League', watchUrl: m.watchLiveUrl,
  }
}

function normEuro(m: EuroMatch): NormMatch {
  return {
    key: normKey(m.date, m.home.code, m.away.code, m.gender),
    date: m.date, gender: m.gender,
    status: m.status as NormMatch['status'],
    home: { name: m.home.name, short: m.home.code, score: m.home.score, logo: m.home.logo },
    away: { name: m.away.name, short: m.away.code, score: m.away.score, logo: m.away.logo },
    tourName: m.tournamentName, watchUrl: m.watchUrl || null, eventUrl: m.eventUrl || null,
  }
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
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 4 }}>
        <TeamCell short={m.home.short} name={m.home.name} won={homeWon} logo={m.home.logo} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, minWidth: 44, gap: 4 }}>
          {isLive
            ? <span style={{ fontSize: 9, fontWeight: 800, color: '#e33', letterSpacing: 1 }}>● LIVE</span>
            : isResult && m.eventUrl
              ? <a href={m.eventUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', background: 'rgba(0,58,208,0.1)', padding: '3px 8px', borderRadius: 8, whiteSpace: 'nowrap' }}>Results →</a>
              : isResult && m.home.score !== null && m.away.score !== null
                ? <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1 }}>{m.home.score}–{m.away.score}</span>
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
        {m.eventUrl && (
          <a href={m.eventUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', background: 'rgba(0,58,208,0.1)', padding: '4px 10px', borderRadius: 10 }}>
            Info →
          </a>
        )}
        {m.watchUrl && (
          <a href={m.watchUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', textDecoration: 'none', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 10 }}>
            <Clapperboard size={11} strokeWidth={2.5} /> {!isResult && <span>Watch</span>}
          </a>
        )}
        {m.moreUrl && (
          <a href={m.moreUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', background: 'rgba(0,58,208,0.1)', padding: '4px 10px', borderRadius: 10 }}>
            Info →
          </a>
        )}
      </div>
    </div>
  )
}

function ComingUpCarousel({ fihData, proLeagueData, euroData }: { fihData: FIHData | null; proLeagueData: ProLeagueData | null; euroData: EuroData | null }) {
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
    // Pro League may overlap with FIH — add only if key not already present
    if (proLeagueData) {
      combined.push(...proLeagueData.men.recent.map(normPro), ...proLeagueData.men.upcoming.map(normPro))
      combined.push(...proLeagueData.women.recent.map(normPro), ...proLeagueData.women.upcoming.map(normPro))
    }
    if (euroData) {
      combined.push(...euroData.matches.map(normEuro))
    }
    // Deduplicate: first occurrence wins
    const seen = new Set<string>()
    return combined.filter(m => { if (seen.has(m.key)) return false; seen.add(m.key); return true })
  }, [fihData, proLeagueData, euroData])

  const isLoaded = fihData !== null || proLeagueData !== null || euroData !== null

  const filtered = all.filter(m => {
    if (gender !== 'all' && m.gender !== gender) return false
    if (tab === 'upcoming') return m.status === 'upcoming' || m.status === 'live'
    return m.status === 'completed'
  }).sort((a, b) =>
    tab === 'upcoming'
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div style={{ marginBottom: 48, background: 'var(--bg-card)', borderRadius: '0 0 12px 12px', border: '1px solid var(--border)', borderTop: 'none', padding: '14px 24px 0' }}>
      <CarouselHeader
        title="⚡ Coming Up"
        href="https://www.fih.hockey/schedule-fixtures-results"
        hrefLabel="FIH"
        controls={
          <div style={{ display: 'flex', gap: 6 }}>
            <TabPill active={gender === 'all'} onClick={() => setGender('all')} label="All" />
            <TabPill active={gender === 'M'}   onClick={() => setGender('M')}   label="Men" />
            <TabPill active={gender === 'F'}   onClick={() => setGender('F')}   label="Women" />
            <TabPill active={tab === 'upcoming'} onClick={() => setTab('upcoming')} label="Upcoming" />
            <TabPill active={tab === 'results'}  onClick={() => setTab('results')}  label="Results" />
            {(['left', 'right'] as const).map(d => (
              <button key={d} onClick={() => scroll(d)} style={{ width: 26, height: 26, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                {d === 'left' ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
              </button>
            ))}
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

function FIHIntlCarousel({ data }: { data: FIHData | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [gender, setGender] = useState<'M' | 'F' | 'all'>('all')
  const [tab, setTab]       = useState<'recent' | 'upcoming'>('recent')
  const allRecent   = data ? [...(data.men.recent),   ...(data.women.recent)]  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : []
  const allUpcoming = data ? [...(data.men.upcoming), ...(data.women.upcoming)].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : []
  const gData   = gender === 'all' ? null : data ? (gender === 'M' ? data.men : data.women) : null
  const matches = gender === 'all'
    ? (tab === 'recent' ? allRecent : allUpcoming)
    : gData ? (tab === 'recent' ? gData.recent : gData.upcoming) : []
  const scroll  = (d: 'left' | 'right') => ref.current?.scrollBy({ left: d === 'left' ? -200 : 200, behavior: 'smooth' })
  return (
    <div style={{ marginBottom: 40 }}>
      <CarouselHeader
        title="🌍 FIH International"
        href="https://www.fih.hockey/schedule-fixtures-results"
        hrefLabel="FIH"
        controls={
          <div style={{ display: 'flex', gap: 6 }}>
            <TabPill active={gender === 'all'} onClick={() => setGender('all')} label="All" />
            <TabPill active={gender === 'M'}   onClick={() => setGender('M')}   label="Men" />
            <TabPill active={gender === 'F'}   onClick={() => setGender('F')}   label="Women" />
            <TabPill active={tab === 'recent'}   onClick={() => setTab('recent')}   label="Results"  />
            <TabPill active={tab === 'upcoming'} onClick={() => setTab('upcoming')} label="Upcoming" />
            {(['left','right'] as const).map(d => (
              <button key={d} onClick={() => scroll(d)} style={{ width: 26, height: 26, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                {d === 'left' ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
              </button>
            ))}
          </div>
        }
      />
      <div ref={ref} style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {!data
          ? [...Array(7)].map((_, i) => <div key={i} style={{ flexShrink: 0, width: 176, height: 120, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', opacity: 0.5 }} />)
          : matches.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '20px 0' }}>No {tab === 'recent' ? 'results' : 'upcoming matches'}</p>
            : matches.map((m, i) => <MatchCarouselCard key={i} match={m} isResult={tab === 'recent'} />)
        }
      </div>
    </div>
  )
}

function FIHProLeagueCarousel({ data }: { data: ProLeagueData | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [gender, setGender] = useState<'M' | 'F' | 'all'>('all')
  const [tab, setTab]       = useState<'recent' | 'upcoming'>('recent')
  const allRecent   = data ? [...(data.men.recent),   ...(data.women.recent)]  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : []
  const allUpcoming = data ? [...(data.men.upcoming), ...(data.women.upcoming)].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : []
  const gData   = gender === 'all' ? null : data ? (gender === 'M' ? data.men : data.women) : null
  const matches = gender === 'all'
    ? (tab === 'recent' ? allRecent : allUpcoming)
    : gData ? (tab === 'recent' ? gData.recent : gData.upcoming) : []
  const scroll  = (d: 'left' | 'right') => ref.current?.scrollBy({ left: d === 'left' ? -200 : 200, behavior: 'smooth' })
  return (
    <div style={{ marginBottom: 40 }}>
      <CarouselHeader
        title="🏆 FIH Pro League"
        href="https://www.fih.hockey/events/fih-pro-league/schedule-fixtures-results"
        hrefLabel="FIH"
        controls={
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <TabPill active={gender === 'all'} onClick={() => setGender('all')} label="All" />
            <TabPill active={gender === 'M'}   onClick={() => setGender('M')}   label="Men" />
            <TabPill active={gender === 'F'}   onClick={() => setGender('F')}   label="Women" />
            <TabPill active={tab === 'recent'}   onClick={() => setTab('recent')}   label="Results"  />
            <TabPill active={tab === 'upcoming'} onClick={() => setTab('upcoming')} label="Upcoming" />
{(['left','right'] as const).map(d => (
              <button key={d} onClick={() => scroll(d)} style={{ width: 26, height: 26, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                {d === 'left' ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
              </button>
            ))}
          </div>
        }
      />
      <div ref={ref} style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {!data
          ? [...Array(7)].map((_, i) => <div key={i} style={{ flexShrink: 0, width: 176, height: 120, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', opacity: 0.5 }} />)
          : matches.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '20px 0' }}>No {tab === 'recent' ? 'results' : 'upcoming matches'}</p>
            : matches.map((m, i) => <MatchCarouselCard key={i} match={m} isResult={tab === 'recent'} />)
        }
      </div>
    </div>
  )
}

function EuroHockeyCarousel({ data }: { data: EuroData | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [gender, setGender] = useState<'M' | 'F' | 'all'>('all')
  const [tab, setTab]       = useState<'matches' | 'tournaments'>('matches')
  const scroll = (d: 'left' | 'right') => ref.current?.scrollBy({ left: d === 'left' ? -200 : 200, behavior: 'smooth' })

  const matches     = data?.matches ?? []
  const tournaments = data?.tournaments ?? []
  const filtMatches = gender === 'all' ? matches : matches.filter(m => m.gender === gender)
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
      <CarouselHeader
        title="🇪🇺 EuroHockey"
        href="https://eurohockey.org/calendar"
        hrefLabel="Calendar"
        controls={
          <div style={{ display: 'flex', gap: 6 }}>
            <TabPill active={tab === 'matches'}     onClick={() => setTab('matches')}     label="Matches" />
            <TabPill active={tab === 'tournaments'} onClick={() => setTab('tournaments')} label="Tournaments" />
            <TabPill active={gender === 'all'} onClick={() => setGender('all')} label="All" />
            <TabPill active={gender === 'M'}   onClick={() => setGender('M')}   label="Men" />
            <TabPill active={gender === 'F'}   onClick={() => setGender('F')}   label="Women" />
            {(['left','right'] as const).map(d => (
              <button key={d} onClick={() => scroll(d)} style={{ width: 26, height: 26, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                {d === 'left' ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
              </button>
            ))}
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
                            ? <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1 }}>{m.home.score}–{m.away.score}</span>
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

function NLLeagueCarousel({ menData, womenData }: { menData: MatchData | null; womenData: MatchData | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [gender, setGender] = useState<'all' | 'men' | 'women'>('all')
  const [tab, setTab]       = useState<'results' | 'upcoming'>('results')
  const scroll = (d: 'left' | 'right') => ref.current?.scrollBy({ left: d === 'left' ? -200 : 200, behavior: 'smooth' })

  type Tagged = Match & { _gender: 'men' | 'women' }
  const tag = (ms: Match[], g: 'men' | 'women'): Tagged[] => ms.map(m => ({ ...m, _gender: g }))
  const allResults  = [...tag(menData?.results ?? [], 'men'),  ...tag(womenData?.results ?? [], 'women')] .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const allUpcoming = [...tag(menData?.upcoming ?? [], 'men'), ...tag(womenData?.upcoming ?? [], 'women')].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const gData   = gender === 'all' ? null : gender === 'men' ? menData : womenData
  const matches: Tagged[] = gender === 'all'
    ? (tab === 'results' ? allResults : allUpcoming)
    : tag(gData ? (tab === 'results' ? gData.results : gData.upcoming) : [], gender as 'men' | 'women')

  return (
    <div style={{ marginBottom: 40 }}>
      <CarouselHeader
        title="🇳🇱 Netherlands Hoofdklasse"
        href="/competition"
        hrefLabel="All"
        controls={
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <TabPill active={gender === 'all'}   onClick={() => setGender('all')}   label="All" />
            <TabPill active={gender === 'men'}   onClick={() => setGender('men')}   label="Men" />
            <TabPill active={gender === 'women'} onClick={() => setGender('women')} label="Women" />
            <TabPill active={tab === 'results'}  onClick={() => setTab('results')}  label="Results" />
            <TabPill active={tab === 'upcoming'} onClick={() => setTab('upcoming')} label="Upcoming" />
            {(['left','right'] as const).map(d => (
              <button key={d} onClick={() => scroll(d)} style={{ width: 26, height: 26, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                {d === 'left' ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
              </button>
            ))}
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
            ? <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1 }}>{m.score.home}–{m.score.away}</span>
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

/* ─── (sidebar FIH/Euro sections removed — now full-width carousels) ──────── */

function _unusedFIHIntlSection({ data }: { data: FIHData | null }) {
  const [gender, setGender] = useState<'M' | 'F'>('M')
  const [tab, setTab]       = useState<'recent' | 'upcoming'>('recent')

  const gData = data ? (gender === 'M' ? data.men : data.women) : null
  const matches = gData ? (tab === 'recent' ? gData.recent : gData.upcoming) : []

  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', background: '#ffffff', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #eef0f4' }}>
      <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid #eef0f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#333' }}>🌍 FIH International</span>
        <a href="https://www.fih.hockey/schedule-fixtures-results" target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontWeight: 600, color: '#999', textDecoration: 'none' }}>FIH →</a>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid #eef0f4' }}>
        {(['M', 'F'] as const).map(g => (
          <button key={g} onClick={() => setGender(g)} style={{ flex: 1, padding: '9px', border: 'none', borderBottom: gender === g ? '2px solid #003ad0' : '2px solid transparent', background: '#fff', color: gender === g ? '#003ad0' : '#aaa', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s', marginBottom: -1 }}>
            {g === 'M' ? 'Men' : 'Women'}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', padding: '8px 12px', gap: 6, borderBottom: '1px solid #eef0f4' }}>
        {(['recent', 'upcoming'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '4px 12px', border: 'none', borderRadius: 20, background: tab === t ? '#f0f2f5' : 'transparent', color: tab === t ? '#333' : '#aaa', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s' }}>
            {t === 'recent' ? 'Results' : 'Upcoming'}
          </button>
        ))}
      </div>
      <div style={{ padding: '8px 10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {!data
          ? [...Array(3)].map((_, i) => <div key={i} style={{ height: 68, borderRadius: 10, background: '#f4f5f8', opacity: 0.6 }} />)
          : matches.length === 0
            ? <p style={{ fontSize: 12, color: '#aaa', padding: '12px 0', textAlign: 'center', margin: 0 }}>No {tab === 'recent' ? 'results' : 'upcoming matches'}</p>
            : matches.map((m, i) => <FIHMatchRow key={i} match={m} isResult={tab === 'recent'} />)
        }
      </div>
    </div>
  )
}

/* ─── FIH Pro League — sidebar ───────────────────────────────────────────── */

function FIHProLeagueSection({ data }: { data: ProLeagueData | null }) {
  const [gender, setGender] = useState<'M' | 'F'>('M')
  const [tab, setTab]       = useState<'recent' | 'upcoming'>('recent')

  const gData = data ? (gender === 'M' ? data.men : data.women) : null
  const matches = gData ? (tab === 'recent' ? gData.recent : gData.upcoming) : []

  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', background: '#ffffff', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #eef0f4' }}>
      <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid #eef0f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#333' }}>🏆 FIH Pro League</span>
        <a href="https://www.fih.hockey/events/fih-pro-league/schedule-fixtures-results" target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontWeight: 600, color: '#999', textDecoration: 'none' }}>FIH →</a>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid #eef0f4' }}>
        {(['M', 'F'] as const).map(g => (
          <button key={g} onClick={() => setGender(g)} style={{ flex: 1, padding: '9px', border: 'none', borderBottom: gender === g ? '2px solid #003ad0' : '2px solid transparent', background: '#fff', color: gender === g ? '#003ad0' : '#aaa', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s', marginBottom: -1 }}>
            {g === 'M' ? 'Men' : 'Women'}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', padding: '8px 12px', gap: 6, borderBottom: '1px solid #eef0f4' }}>
        {(['recent', 'upcoming'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '4px 12px', border: 'none', borderRadius: 20, background: tab === t ? '#f0f2f5' : 'transparent', color: tab === t ? '#333' : '#aaa', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s' }}>
            {t === 'recent' ? 'Results' : 'Upcoming'}
          </button>
        ))}
      </div>
      <div style={{ padding: '8px 10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {!data
          ? [...Array(3)].map((_, i) => <div key={i} style={{ height: 68, borderRadius: 10, background: '#f4f5f8', opacity: 0.6 }} />)
          : matches.length === 0
            ? <p style={{ fontSize: 12, color: '#aaa', padding: '12px 0', textAlign: 'center', margin: 0 }}>No {tab === 'recent' ? 'results' : 'upcoming matches'}</p>
            : matches.map((m, i) => <FIHMatchRow key={i} match={m} isResult={tab === 'recent'} watchLiveUrl={tab === 'upcoming' ? m.watchLiveUrl : null} />)
        }
      </div>
      {data?.watchLiveUrl && tab === 'upcoming' && (
        <div style={{ padding: '0 12px 12px' }}>
          <a href={data.watchLiveUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#003ad0', background: '#f0f4ff', borderRadius: 10, padding: '9px', textDecoration: 'none', letterSpacing: 0.5 }}>
            ▶ Watch Live
          </a>
        </div>
      )}
    </div>
  )
}

/* ─── EuroHockey tournaments — sidebar ──────────────────────────────────── */

function _unusedEuroHockeySection({ data }: { data: EuroData | null }) {
  const [gender, setGender] = useState<'M' | 'F' | 'all'>('all')

  const combined = data ? [...(data.tournaments ?? [])] : []
  const filtered = gender === 'all' ? combined : combined.filter(e => e.gender === gender)

  function fmtDateRange(start: string, end: string) {
    const s = new Date(start), e = new Date(end)
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth())
      return `${s.getDate()}–${e.toLocaleDateString('en-GB', opts)} ${e.getFullYear()}`
    return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', opts)}`
  }

  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', background: '#ffffff', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #eef0f4' }}>
      <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid #eef0f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#333' }}>🇪🇺 EuroHockey</span>
        <a href="https://eurohockey.org/calendar" target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontWeight: 600, color: '#999', textDecoration: 'none' }}>Calendar →</a>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid #eef0f4' }}>
        {([['all', 'All'], ['M', 'Men'], ['F', 'Women']] as const).map(([g, label]) => (
          <button key={g} onClick={() => setGender(g as 'M' | 'F' | 'all')} style={{ flex: 1, padding: '9px', border: 'none', borderBottom: gender === g ? '2px solid #003ad0' : '2px solid transparent', background: '#fff', color: gender === g ? '#003ad0' : '#aaa', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s', marginBottom: -1 }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ padding: '8px 10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {!data
          ? [...Array(3)].map((_, i) => <div key={i} style={{ height: 58, borderRadius: 10, background: '#f4f5f8', opacity: 0.6 }} />)
          : filtered.length === 0
            ? <p style={{ fontSize: 12, color: '#aaa', padding: '12px 0', textAlign: 'center', margin: 0 }}>No upcoming events</p>
            : filtered.slice(0, 6).map(e => (
                <div key={e.id} style={{ borderRadius: 10, padding: '10px 12px', background: e.status === 'ongoing' ? '#fff8f0' : '#fafafa', border: `1px solid ${e.status === 'ongoing' ? '#ffd6a5' : '#eef0f4'}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                    <div style={{ minWidth: 0 }}>
                      {e.status === 'ongoing' && <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, color: '#e07000', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>● Live now</span>}
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#222', display: 'block', lineHeight: 1.3 }}>{e.name}</span>
                      <span style={{ fontSize: 10, color: '#999', display: 'block', marginTop: 2 }}>{e.gender === 'M' ? '♂' : '♀'} · {e.location}</span>
                      <span style={{ fontSize: 10, color: '#bbb', display: 'block' }}>{fmtDateRange(e.startDate, e.endDate)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                      <a href={e.eventUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, fontWeight: 700, color: '#003ad0', textDecoration: 'none', background: '#f0f4ff', padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>Info →</a>
                      <a href={e.watchUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, fontWeight: 700, color: '#555', textDecoration: 'none', background: '#f4f5f8', padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>Watch →</a>
                    </div>
                  </div>
                </div>
              ))
        }
      </div>
    </div>
  )
}

/* ─── FIH Match Row (no logos, uses short names) ─────────────────────────── */

function FIHMatchRow({ match: m, isResult, watchLiveUrl }: { match: FIHMatch | ProLeagueMatch; isResult: boolean; watchLiveUrl?: string | null }) {
  const homeWon = isResult && m.home.score !== null && m.away.score !== null && m.home.score > m.away.score
  const awayWon = isResult && m.home.score !== null && m.away.score !== null && m.away.score > m.home.score
  const isLive  = m.status === 'live'
  const moreUrl   = 'game_id' in m ? fihMatchUrl(m as FIHMatch) : null
  const venueTime = 'venueTime' in m ? (m as FIHMatch).venueTime ?? null : null
  const myTime    = fmtLocalTime(m.date)
  return (
    <div style={{ borderRadius: 10, padding: '10px 8px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid #f0f2f5' }}>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: 11, fontWeight: 900, color: '#333' }}>{(m.home.short || m.home.name)[0]}</div>
        <span style={{ fontSize: 10, fontWeight: homeWon ? 700 : 400, color: homeWon ? '#111' : '#888', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home.short || m.home.name}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0, minWidth: 52 }}>
        {isLive
          ? <span style={{ fontSize: 9, fontWeight: 800, color: '#e00', letterSpacing: 1, textTransform: 'uppercase' }}>● Live</span>
          : isResult && m.home.score !== null && m.away.score !== null
            ? <span style={{ fontSize: 17, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', lineHeight: 1 }}>{m.home.score}–{m.away.score}</span>
            : <span style={{ fontSize: 11, fontWeight: 500, color: '#bbb' }}>vs</span>
        }
        <span style={{ fontSize: 9, color: '#ccc', fontWeight: 500 }}>{fmtMatchDate(m.date)}</span>
        {(venueTime || myTime) && (
          <span style={{ fontSize: 9, color: '#aaa' }}>
            {venueTime && <><span style={{ fontWeight: 500 }}>{venueTime}</span> <span style={{ color: '#ccc' }}>local</span>{myTime && <span style={{ color: '#ddd' }}> · </span>}</>}
            {myTime && <><span style={{ fontWeight: 800, color: '#555' }}>{myTime}</span> <span style={{ color: '#ccc' }}>yours</span></>}
          </span>
        )}
        {isResult && !isLive && <span style={{ fontSize: 8, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: 0.5 }}>FT</span>}
        {watchLiveUrl && (
          <a href={watchLiveUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 8, fontWeight: 700, color: '#003ad0', textDecoration: 'none', background: '#f0f4ff', padding: '2px 6px', borderRadius: 4, marginTop: 2, whiteSpace: 'nowrap' }}>▶ Watch</a>
        )}
        {moreUrl && (
          <a href={moreUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 8, fontWeight: 700, color: '#555', textDecoration: 'none', background: '#f4f5f8', border: '1px solid #e8eaed', padding: '2px 6px', borderRadius: 4, marginTop: 2, whiteSpace: 'nowrap' }}>More →</a>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: 11, fontWeight: 900, color: '#333' }}>{(m.away.short || m.away.name)[0]}</div>
        <span style={{ fontSize: 10, fontWeight: awayWon ? 700 : 400, color: awayWon ? '#111' : '#888', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.away.short || m.away.name}</span>
      </div>
    </div>
  )
}

/* ─── League Match Section (Netherlands etc.) ────────────────────────────── */
// ── League Match Section ──────────────────────────────────────────────────────

interface LeagueCountry { key: string; flag: string; label: string; men: MatchData | null; women: MatchData | null }

function LeagueMatchSection({ countries }: { countries: LeagueCountry[] }) {
  const [countryKey, setCountryKey] = useState(countries[0]?.key ?? '')
  const [gender, setGender]         = useState<'men' | 'women'>('men')
  const [tab, setTab]               = useState<'results' | 'upcoming'>('results')

  const country = countries.find(c => c.key === countryKey) ?? countries[0]
  const data    = gender === 'men' ? country?.men : country?.women
  const matches = (data ? (tab === 'results' ? data.results : data.upcoming) : []).slice(0, 5)

  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', background: '#ffffff', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #eef0f4' }}>

      {/* Header */}
      <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid #eef0f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#333' }}>League Results</span>
        <Link href="/competition" style={{ fontSize: 10, fontWeight: 600, color: '#999', textDecoration: 'none' }}>View all →</Link>
      </div>

      {/* Country tabs */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 12px', borderBottom: '1px solid #eef0f4', flexWrap: 'wrap' }}>
        {countries.map(c => (
          <button key={c.key} onClick={() => setCountryKey(c.key)} style={{ padding: '5px 12px', border: 'none', borderRadius: 20, background: countryKey === c.key ? '#003ad0' : '#f0f2f5', color: countryKey === c.key ? '#fff' : '#555', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}>
            {c.flag} {c.label}
          </button>
        ))}
      </div>

      {/* Men / Women tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #eef0f4' }}>
        {(['men', 'women'] as const).map(g => (
          <button key={g} onClick={() => setGender(g)} style={{ flex: 1, padding: '9px', border: 'none', borderBottom: gender === g ? '2px solid #003ad0' : '2px solid transparent', background: '#fff', color: gender === g ? '#003ad0' : '#aaa', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s', marginBottom: -1 }}>
            {g === 'men' ? 'Men' : 'Women'}
          </button>
        ))}
      </div>

      {/* Results / Upcoming tabs */}
      <div style={{ display: 'flex', padding: '8px 12px', gap: 6, borderBottom: '1px solid #eef0f4' }}>
        {(['results', 'upcoming'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '4px 12px', border: 'none', borderRadius: 20, background: tab === t ? '#f0f2f5' : 'transparent', color: tab === t ? '#333' : '#aaa', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s' }}>
            {t === 'results' ? 'Results' : 'Upcoming'}
          </button>
        ))}
      </div>

      {/* Match list */}
      <div style={{ padding: '8px 10px 12px', display: 'flex', flexDirection: 'column' }}>
        {!data
          ? [...Array(3)].map((_, i) => <div key={i} style={{ height: 68, borderRadius: 10, background: '#f4f5f8', margin: '2px 0', opacity: 0.6 }} />)
          : matches.length === 0
            ? <p style={{ fontSize: 12, color: '#aaa', padding: '12px 0', textAlign: 'center' }}>No {tab === 'results' ? 'results' : 'upcoming matches'}</p>
            : matches.map(m => <MatchRow key={m.id} match={m} isResult={tab === 'results'} />)
        }
      </div>
    </div>
  )
}


function MatchRow({ match: m, isResult }: { match: Match; isResult: boolean }) {
  const homeWon = isResult && m.score ? m.score.home > m.score.away : false
  const awayWon = isResult && m.score ? m.score.away > m.score.home : false
  return (
    <div style={{ borderRadius: 10, padding: '10px 10px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f0f2f5' }}>
      {/* Home */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <TeamLogo logo={m.home.logo} name={m.home.name} />
        <span style={{ fontSize: 10, fontWeight: homeWon ? 700 : 400, color: homeWon ? '#111' : '#999', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 70 }}>{m.home.name}</span>
      </div>
      {/* Score / Date */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        {isResult && m.score
          ? <span style={{ fontSize: 18, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', lineHeight: 1 }}>{m.score.home}–{m.score.away}</span>
          : <span style={{ fontSize: 11, fontWeight: 500, color: '#bbb' }}>vs</span>
        }
        <span style={{ fontSize: 9, color: '#ccc', fontWeight: 500 }}>{fmtMatchDate(m.date)}</span>
        {isResult && <span style={{ fontSize: 8, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: 0.5 }}>FT</span>}
      </div>
      {/* Away */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <TeamLogo logo={m.away.logo} name={m.away.name} />
        <span style={{ fontSize: 10, fontWeight: awayWon ? 700 : 400, color: awayWon ? '#111' : '#999', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 70 }}>{m.away.name}</span>
      </div>
    </div>
  )
}

function TeamLogo({ logo, name, small }: { logo: string | null; name: string; small?: boolean }) {
  const size = small ? 26 : 36
  const imgSize = small ? 18 : 26
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#fff', border: '1.5px solid #eef0f4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      {logo ? <img src={logo} alt={name} style={{ width: imgSize, height: imgSize, objectFit: 'contain' }} /> : <span style={{ fontSize: small ? 9 : 12, fontWeight: 900, color: '#333' }}>{name[0]}</span>}
    </div>
  )
}


/* ─── Video carousel ─────────────────────────────────────────────────────── */
function VideoCarousel({ label, videos }: { label: string; videos: Video[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (d: 'left' | 'right') => ref.current?.scrollBy({ left: d === 'left' ? -270 : 270, behavior: 'smooth' })
  return (
    <div style={{ marginBottom: 52 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: 0.3, color: 'var(--text-primary)' }}>{label}</span>
          <div style={{ height: 1, background: 'var(--border)', width: 40 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/videos" style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', letterSpacing: 1 }}>All →</Link>
          {(['left', 'right'] as const).map(d => (
            <button key={d} onClick={() => scroll(d)} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .2s, color .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              {d === 'left' ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
            </button>
          ))}
        </div>
      </div>
      <div ref={ref} style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {videos.map(v => <VideoCard key={v.id} video={v} />)}
      </div>
    </div>
  )
}

function VideoCard({ video }: { video: Video }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={video.youtube_url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, width: 240, textDecoration: 'none' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)', transition: 'transform .25s, box-shadow .25s', transform: hov ? 'translateY(-3px)' : 'none', boxShadow: hov ? '0 16px 40px rgba(0,0,0,.4)' : 'none' }}>
        <div style={{ position: 'relative', height: 135, overflow: 'hidden', background: '#0a0a0a' }}>
          <img src={video.thumbnail_url} alt={getVideoTitle(video)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .4s', transform: hov ? 'scale(1.06)' : 'scale(1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: hov ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: hov ? 'var(--accent)' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s', boxShadow: hov ? '0 0 20px rgba(0,58,208,0.35)' : 'none' }}>
              <Play size={15} fill={hov ? '#000' : '#fff'} color={hov ? '#000' : '#fff'} style={{ marginLeft: 2 }} />
            </div>
          </div>
        </div>
        <div style={{ padding: '11px 13px 14px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: hov ? 'var(--accent)' : 'var(--text-primary)', transition: 'color .2s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>{getVideoTitle(video)}</p>
        </div>
      </div>
    </a>
  )
}
