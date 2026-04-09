'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { getArticles, Article, getVideos, Video, getTitle, getText, getSlug, getVideoTitle, getArticleSource } from '@/lib/supabase'
import { Play, ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react'
import type { Match, Poule } from '@/lib/hockey-api'

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

function fmtMatchDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getRecentResults(poules: Poule[], limit = 12): Match[] {
  return poules.flatMap(p => p.matches)
    .filter(m => m.status === 'final' && m.score)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

function getUpcomingMatches(poules: Poule[], limit = 12): Match[] {
  return poules.flatMap(p => p.matches)
    .filter(m => m.status !== 'final' && m.status !== 'live')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit)
}

// ── Country config ─────────────────────────────────────────────────────────────

const COUNTRY_CONFIG = [
  { flag: '🇳🇱', name: 'Netherlands',   href: '/netherlands',   domain: 'hockey.nl' },
  { flag: '🇬🇧', name: 'Great Britain', href: '/great-britain', domain: 'greatbritainhockey' },
  { flag: '🇦🇺', name: 'Australia',     href: '/australia',     domain: 'hockey.org.au' },
  { flag: '🇩🇪', name: 'Germany',       href: '/germany',       domain: 'hockey.de' },
  { flag: '🇧🇪', name: 'Belgium',       href: '/belgium',       domain: 'hockey.be' },
  { flag: '🇪🇸', name: 'Spain',         href: '/spain',         domain: 'eshockey.es' },
  { flag: '🇦🇷', name: 'Argentina',     href: '/argentina',     domain: 'cahockey.org.ar' },
  { flag: '🇮🇪', name: 'Ireland',       href: '/ireland',       domain: 'hockey.ie' },
  { flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', name: 'Scotland',     href: '/scotland',      domain: 'scottish-hockey' },
  { flag: '🇮🇳', name: 'India',         href: '/india',         domain: 'hockeyindia' },
]

// ── Main page ──────────────────────────────────────────────────────────────────

interface MatchData { name: string; results: Match[]; upcoming: Match[] }

export default function Home() {
  const [articles, setArticles]       = useState<Article[]>([])
  const [damesVideos, setDamesVideos] = useState<Video[]>([])
  const [herenVideos, setHerenVideos] = useState<Video[]>([])
  const [fihVideos,   setFihVideos]   = useState<Video[]>([])
  const [loading, setLoading]         = useState(true)
  const [intlData,  setIntlData]      = useState<MatchData | null>(null)

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
    fetch('/api/hockey?comp=international&id=44')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setIntlData({
        name: d.name,
        results:  getRecentResults(d.poules ?? []),
        upcoming: getUpcomingMatches(d.poules ?? []),
      }))
      .catch(() => {})
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // Group articles by country
  const byCountry: Record<string, Article[]> = {}
  for (const a of articles) {
    const src = getArticleSource(a)
    const key = src.country
    if (!byCountry[key]) byCountry[key] = []
    byCountry[key].push(a)
  }

  // Hero = latest article overall
  const hero = articles[0]

  return (
    <>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .page-wrap        { max-width: 1200px; margin: 0 auto; padding: 28px 24px 100px; animation: fadeUp .4s ease; }
        .card-hover       { transition: transform .22s ease, box-shadow .22s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 56px rgba(0,0,0,.5); }
        .img-zoom img     { transition: transform .6s ease; }
        .img-zoom:hover img { transform: scale(1.05); }
        .title-hover      { transition: color .2s ease; }
        .card-hover:hover .title-hover { color: var(--accent) !important; }
        .art-row          { display: flex; gap: 14px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
        .art-row::-webkit-scrollbar { display: none; }
        .match-tab        { border: none; background: none; cursor: pointer; padding: 7px 16px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; transition: all .15s; }
      `}</style>

      <div className="page-wrap">

        {/* ═══ HERO ════════════════════════════════════════════════════════ */}
        {hero && <HeroCard article={hero} />}

        {/* ═══ PER-COUNTRY ARTICLE FEEDS ════════════════════════════════════ */}
        {COUNTRY_CONFIG.map(c => {
          const arts = byCountry[c.name]
          if (!arts?.length) return null
          return (
            <CountryFeed key={c.name} config={c} articles={arts.slice(0, 8)} />
          )
        })}

        {/* ═══ INTERNATIONAL MATCHES ════════════════════════════════════════ */}
        {intlData && (intlData.results.length > 0 || intlData.upcoming.length > 0) && (
          <IntlMatchSection data={intlData} />
        )}

        {/* ═══ VIDEOS ═══════════════════════════════════════════════════════ */}
        {damesVideos.length > 0 && <VideoCarousel label="🏑 Hoofdklasse Dames" videos={damesVideos} />}
        {herenVideos.length > 0  && <VideoCarousel label="🏑 Hoofdklasse Heren" videos={herenVideos} />}
        {fihVideos.length > 0    && <VideoCarousel label="🌍 FIH Hockey" videos={fihVideos} />}

      </div>
    </>
  )
}

/* ─── Section divider ────────────────────────────────────────────────────── */
function SectionDivider({ label, href }: { label: string; href?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      {href && (
        <Link href={href} style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', textDecoration: 'none', letterSpacing: 1, whiteSpace: 'nowrap' }}>View all →</Link>
      )}
    </div>
  )
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
function HeroCard({ article }: { article: Article }) {
  const [hov, setHov] = useState(false)
  const slug   = getSlug(article)
  const title  = getTitle(article)
  const text   = (getText(article) || '').slice(0, 200).trim() + '…'
  const source = getArticleSource(article)

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 48, borderRadius: 20, overflow: 'hidden' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div style={{ position: 'relative', height: 500, overflow: 'hidden', borderRadius: 20, cursor: 'pointer' }}>
        {article.image_url
          ? <img src={article.image_url} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .7s ease', transform: hov ? 'scale(1.04)' : 'scale(1)' }} />
          : <div style={{ position: 'absolute', inset: 0, background: '#111' }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,58,208,0.92) 0%, rgba(0,58,208,0.55) 32%, transparent 62%)' }} />
        <div style={{ position: 'absolute', top: 24, left: 24, display: 'flex', gap: 8 }}>
          <span style={{ background: 'var(--green)', color: '#003ad0', fontSize: 10, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 6 }}>Top Story</span>
          <span style={{ background: '#003ad0', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '5px 10px', borderRadius: 6 }}>
            {source.flag} {source.country}
          </span>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Clock size={11} color="rgba(255,255,255,0.45)" />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>{timeAgo(article.scraped_at)}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 44px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px', color: hov ? 'var(--green)' : '#fff', marginBottom: 14, maxWidth: 760, transition: 'color .2s' }}>
            {title}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 620 }}>{text}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 22, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, padding: '8px 20px', fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>
            Read article →
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ─── Country feed row ───────────────────────────────────────────────────── */
interface CountryCfg { flag: string; name: string; href: string; domain: string }

function CountryFeed({ config, articles }: { config: CountryCfg; articles: Article[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (d: 'left' | 'right') => ref.current?.scrollBy({ left: d === 'left' ? -280 : 280, behavior: 'smooth' })

  return (
    <div style={{ marginBottom: 52 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{config.flag}</span>
          <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: 0.5, color: 'var(--text-primary)' }}>{config.name}</span>
          <div style={{ width: 30, height: 1, background: 'var(--border)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href={config.href} style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', letterSpacing: 1 }}>All News →</Link>
          {(['left', 'right'] as const).map(d => (
            <button key={d} onClick={() => scroll(d)} style={{ width: 26, height: 26, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              {d === 'left' ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal article cards */}
      <div ref={ref} className="art-row">
        {articles.map(a => <ArticleMiniCard key={a.id} article={a} />)}
      </div>
    </div>
  )
}

function ArticleMiniCard({ article }: { article: Article }) {
  const [hov, setHov] = useState(false)
  const slug  = getSlug(article)
  const title = getTitle(article)

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', flexShrink: 0, width: 220 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div style={{ borderRadius: 13, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)', transition: 'transform .22s, box-shadow .22s', transform: hov ? 'translateY(-3px)' : 'none', boxShadow: hov ? '0 16px 48px rgba(0,0,0,.45)' : 'none' }}>
        <div style={{ height: 130, overflow: 'hidden', background: '#111', position: 'relative' }}>
          {article.image_url
            ? <img src={article.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s', transform: hov ? 'scale(1.06)' : 'scale(1)' }} />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#0d0d0d,#1a1a1a)' }} />
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }} />
        </div>
        <div style={{ padding: '11px 13px 14px' }}>
          <div style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>{timeAgo(article.scraped_at)}</div>
          <p style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.4, color: hov ? 'var(--accent)' : 'var(--text-primary)', transition: 'color .2s', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
            {title}
          </p>
        </div>
      </div>
    </Link>
  )
}

/* ─── International matches section ─────────────────────────────────────── */
function IntlMatchSection({ data }: { data: MatchData }) {
  const [tab, setTab] = useState<'results' | 'upcoming'>(
    data.results.length > 0 ? 'results' : 'upcoming'
  )
  const matches = tab === 'results' ? data.results : data.upcoming

  return (
    <div style={{ marginBottom: 64 }}>
      <SectionDivider label="International Matches" href="/competition" />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 4, width: 'fit-content' }}>
        {([['results', 'Recent Results'], ['upcoming', 'Upcoming']] as const).map(([key, label]) => (
          <button key={key} className="match-tab"
            onClick={() => setTab(key)}
            style={{
              color: tab === key ? '#000' : 'var(--text-secondary)',
              background: tab === key ? 'var(--accent)' : 'transparent',
            }}
          >
            {key === 'upcoming' && <Calendar size={10} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />}
            {label}
          </button>
        ))}
      </div>

      {/* Match cards */}
      {matches.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '20px 0' }}>No {tab === 'results' ? 'recent results' : 'upcoming matches'} available.</p>
      ) : (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 6 }}>
          {matches.map(m => <MatchCard key={m.id} match={m} type={tab} />)}
        </div>
      )}
    </div>
  )
}

function TeamLogo({ logo, name }: { logo: string | null; name: string }) {
  return (
    <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#fff', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
      {logo
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={logo} alt={name} style={{ width: 28, height: 28, objectFit: 'contain' }} />
        : <span style={{ fontSize: 13, fontWeight: 900, color: '#333' }}>{name[0]}</span>
      }
    </div>
  )
}

function MatchCard({ match: m, type }: { match: Match; type: 'results' | 'upcoming' }) {
  const isResult = type === 'results'
  const homeWon = isResult && m.score ? m.score.home > m.score.away : false
  const awayWon = isResult && m.score ? m.score.away > m.score.home : false

  return (
    <div style={{
      flexShrink: 0,
      width: 210,
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'border-color .2s',
    }}>
      {/* Header */}
      <div style={{
        padding: '9px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-card-2)',
      }}>
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', color: isResult ? 'var(--text-secondary)' : 'var(--green)' }}>
          {isResult ? 'Final' : '● Upcoming'}
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>{fmtMatchDate(m.date)}</span>
      </div>

      {/* Teams */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Home row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10 }}>
          <TeamLogo logo={m.home.logo} name={m.home.name} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: homeWon ? 900 : 600, color: homeWon ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {m.home.name}
          </span>
          {isResult && m.score && (
            <span style={{ fontSize: 22, fontWeight: 900, color: homeWon ? 'var(--accent)' : 'var(--text-secondary)', minWidth: 22, textAlign: 'right', lineHeight: 1 }}>
              {m.score.home}
            </span>
          )}
        </div>

        {/* Separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 48, paddingBottom: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            {isResult ? 'vs' : 'vs'}
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Away row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TeamLogo logo={m.away.logo} name={m.away.name} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: awayWon ? 900 : 600, color: awayWon ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {m.away.name}
          </span>
          {isResult && m.score && (
            <span style={{ fontSize: 22, fontWeight: 900, color: awayWon ? 'var(--accent)' : 'var(--text-secondary)', minWidth: 22, textAlign: 'right', lineHeight: 1 }}>
              {m.score.away}
            </span>
          )}
        </div>
      </div>
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
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{label}</span>
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
    <a href={video.youtube_url} target="_blank" rel="noopener noreferrer"
      style={{ flexShrink: 0, width: 240, textDecoration: 'none' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)', transition: 'transform .25s, box-shadow .25s', transform: hov ? 'translateY(-3px)' : 'none', boxShadow: hov ? '0 16px 40px rgba(0,0,0,.4)' : 'none' }}>
        <div style={{ position: 'relative', height: 135, overflow: 'hidden', background: '#0a0a0a' }}>
          <img src={video.thumbnail_url} alt={getVideoTitle(video)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .4s', transform: hov ? 'scale(1.06)' : 'scale(1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: hov ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: hov ? 'var(--accent)' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s', boxShadow: hov ? '0 0 20px rgba(0,58,208,0.35)' : 'none' }}>
              <Play size={15} fill={hov ? '#000' : '#fff'} color={hov ? '#000' : '#fff'} style={{ marginLeft: 2 }} />
            </div>
          </div>
        </div>
        <div style={{ padding: '11px 13px 14px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: hov ? 'var(--accent)' : 'var(--text-primary)', transition: 'color .2s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
            {getVideoTitle(video)}
          </p>
        </div>
      </div>
    </a>
  )
}
