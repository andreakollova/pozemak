'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { getArticles, Article, getVideos, Video, getTitle, getText, getSlug, getVideoTitle, getArticleSource } from '@/lib/supabase'
import { Play, ChevronLeft, ChevronRight, Clock, ExternalLink } from 'lucide-react'
import type { Match, Poule } from '@/lib/hockey-api'

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}
function fmtMatchDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
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

/* ─── Decorative elements ─────────────────────────────────────────────────── */
function GreenBall({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#94FF00',
      flexShrink: 0,
      ...style,
    }} />
  )
}

function GlassTriangle({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'absolute', pointerEvents: 'none', ...style }}>
      <svg width="340" height="306" viewBox="0 0 1168 1053" fill="none">
        <path d="M1167.51 0.000580842L822.09 1052.87L-5.30466e-05 194.917L1167.51 0.000580842Z" fill="#94FF00" fillOpacity="0.07"/>
      </svg>
    </div>
  )
}

function LayeredTriangles({ style }: { style?: React.CSSProperties }) {
  const opacities = [0.08, 0.06, 0.045, 0.03, 0.015]
  return (
    <div style={{ position: 'absolute', pointerEvents: 'none', ...style }}>
      {opacities.map((op, i) => (
        <svg key={i} width="320" height="288" viewBox="0 0 1168 1053" fill="none"
          style={{ position: i === 0 ? 'relative' : 'absolute', top: i * 18, left: i * 14 }}>
          <path d="M1167.51 0.000580842L822.09 1052.87L-5.30466e-05 194.917L1167.51 0.000580842Z"
            fill="#94FF00" fillOpacity={op}/>
        </svg>
      ))}
    </div>
  )
}

/* ─── Section header ──────────────────────────────────────────────────────── */
function SectionHeader({ cfg, scrollRef, light }: { cfg: CountryCfg; scrollRef?: React.RefObject<HTMLDivElement | null>; light?: boolean }) {
  const scroll = (d: 'left' | 'right') => scrollRef?.current?.scrollBy({ left: d === 'left' ? -260 : 260, behavior: 'smooth' })
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22 }}>{cfg.flag}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, letterSpacing: '-0.3px', color: light ? 'rgba(255,255,255,0.9)' : 'var(--text-primary)' }}>{cfg.name}</span>
        <div style={{ width: 1, height: 14, background: 'var(--border-strong)', marginLeft: 4 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href={cfg.href} style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', textDecoration: 'none', letterSpacing: 1.5, textTransform: 'uppercase' }}>All →</Link>
        {scrollRef && (['left', 'right'] as const).map(d => (
          <button key={d} onClick={() => scroll(d)} style={{ width: 26, height: 26, border: '1px solid var(--border-strong)', borderRadius: 7, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            {d === 'left' ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── HOME ────────────────────────────────────────────────────────────────── */
export default function Home() {
  const [articles, setArticles]       = useState<Article[]>([])
  const [damesVideos, setDamesVideos] = useState<Video[]>([])
  const [herenVideos, setHerenVideos] = useState<Video[]>([])
  const [fihVideos,   setFihVideos]   = useState<Video[]>([])
  const [loading, setLoading]         = useState(true)
  const [intlMen,   setIntlMen]       = useState<MatchData | null>(null)
  const [intlWomen, setIntlWomen]     = useState<MatchData | null>(null)

  useEffect(() => {
    Promise.all([
      getArticles(120),
      getVideos('dames', 10),
      getVideos('heren', 10),
      getVideos('fih', 10),
    ]).then(([arts, dames, heren, fih]) => {
      setArticles(arts); setDamesVideos(dames); setHerenVideos(heren); setFihVideos(fih); setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch('/api/hockey?comp=international&id=44').then(r => r.ok ? r.json() : null)
      .then(d => { if (!d) return; const m = getMatches(d); setIntlMen({ name: d.name, results: getRecentResults(m, 5), upcoming: getUpcomingMatches(m, 5), gender: 'men' }) }).catch(() => {})
    fetch('/api/hockey?comp=international&id=45').then(r => r.ok ? r.json() : null)
      .then(d => { if (!d) return; const m = getMatches(d); setIntlWomen({ name: d.name, results: getRecentResults(m, 5), upcoming: getUpcomingMatches(m, 5), gender: 'women' }) }).catch(() => {})
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.08)', borderTop: '2px solid var(--green)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
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
  const allVideos = [...damesVideos, ...herenVideos, ...fihVideos]

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float   { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
        .page-anim         { animation: fadeUp .5s ease both; }
        .art-row           { display:flex; gap:14px; overflow-x:auto; scrollbar-width:none; padding-bottom:4px; }
        .art-row::-webkit-scrollbar { display:none; }
        .pw                { max-width:1200px; margin:0 auto; padding:0 24px; }
        .articles-intl-grid { display:grid; grid-template-columns:1fr 300px; gap:28px; align-items:start; }
        @media(max-width:900px) { .articles-intl-grid { grid-template-columns:1fr; } }
        .card-lift { transition: transform .22s ease, box-shadow .22s ease; }
        .card-lift:hover { transform: translateY(-5px); box-shadow: 0 24px 64px rgba(0,0,0,.55); }
      `}</style>

      <div className="page-anim">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        {hero && <HeroSection article={hero} />}

        {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
        <div style={{ padding: '56px 0 0' }}>

          {/* Netherlands editorial */}
          {(byCountry['Netherlands']?.length ?? 0) > 0 && (
            <div className="pw" style={{ marginBottom: 64 }}>
              <SectionHeader cfg={COUNTRIES.find(c => c.name === 'Netherlands')!} />
              <NLEditorial articles={byCountry['Netherlands'].slice(0, 5)} />
            </div>
          )}

          {/* Articles + Matches sidebar */}
          <div className="pw" style={{ marginBottom: 64 }}>
            <div className="articles-intl-grid">
              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 48 }}>
                {(byCountry['Great Britain']?.length ?? 0) > 0 && (
                  <div>
                    <SectionHeader cfg={COUNTRIES.find(c => c.name === 'Great Britain')!} />
                    <GBGrid articles={byCountry['Great Britain'].slice(0, 3)} />
                  </div>
                )}
                {((byCountry['Australia']?.length ?? 0) > 0 || (byCountry['Germany']?.length ?? 0) > 0) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, minWidth: 0 }}>
                    {(byCountry['Australia']?.length ?? 0) > 0 && (
                      <div style={{ minWidth: 0 }}>
                        <SectionHeader cfg={COUNTRIES.find(c => c.name === 'Australia')!} scrollRef={undefined} />
                        <ScrollRow articles={byCountry['Australia'].slice(0, 5)} cardH={140} />
                      </div>
                    )}
                    {(byCountry['Germany']?.length ?? 0) > 0 && (
                      <div style={{ minWidth: 0 }}>
                        <SectionHeader cfg={COUNTRIES.find(c => c.name === 'Germany')!} />
                        <ScrollRow articles={byCountry['Germany'].slice(0, 5)} cardH={140} />
                      </div>
                    )}
                  </div>
                )}
                {(byCountry['Belgium']?.length ?? 0) > 0 && (
                  <div>
                    <SectionHeader cfg={COUNTRIES.find(c => c.name === 'Belgium')!} />
                    <CompactList articles={byCountry['Belgium'].slice(0, 4)} />
                  </div>
                )}
              </div>
              {/* Matches sidebar */}
              <div style={{ position: 'sticky', top: 20, alignSelf: 'start' }}>
                <IntlMatchSection menData={intlMen} womenData={intlWomen} />
              </div>
            </div>
          </div>

          {/* Spain + Argentina */}
          {((byCountry['Spain']?.length ?? 0) > 0 || (byCountry['Argentina']?.length ?? 0) > 0) && (
            <div className="pw" style={{ marginBottom: 64 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, minWidth: 0 }}>
                {(byCountry['Spain']?.length ?? 0) > 0 && (
                  <div style={{ minWidth: 0 }}>
                    <SectionHeader cfg={COUNTRIES.find(c => c.name === 'Spain')!} />
                    <ScrollRow articles={byCountry['Spain'].slice(0, 6)} cardH={130} />
                  </div>
                )}
                {(byCountry['Argentina']?.length ?? 0) > 0 && (
                  <div style={{ minWidth: 0 }}>
                    <SectionHeader cfg={COUNTRIES.find(c => c.name === 'Argentina')!} />
                    <ScrollRow articles={byCountry['Argentina'].slice(0, 6)} cardH={130} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ireland */}
          {(byCountry['Ireland']?.length ?? 0) > 0 && (
            <div className="pw" style={{ marginBottom: 64 }}>
              <SectionHeader cfg={COUNTRIES.find(c => c.name === 'Ireland')!} />
              <IrelandGrid articles={byCountry['Ireland'].slice(0, 2)} />
            </div>
          )}

          {/* Scotland + India */}
          {((byCountry['Scotland']?.length ?? 0) > 0 || (byCountry['India']?.length ?? 0) > 0) && (
            <div className="pw" style={{ marginBottom: 64 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, minWidth: 0 }}>
                {(byCountry['Scotland']?.length ?? 0) > 0 && (
                  <div style={{ minWidth: 0 }}>
                    <SectionHeader cfg={COUNTRIES.find(c => c.name === 'Scotland')!} />
                    <ScrollRow articles={byCountry['Scotland'].slice(0, 6)} cardH={130} />
                  </div>
                )}
                {(byCountry['India']?.length ?? 0) > 0 && (
                  <div style={{ minWidth: 0 }}>
                    <SectionHeader cfg={COUNTRIES.find(c => c.name === 'India')!} />
                    <ScrollRow articles={byCountry['India'].slice(0, 6)} cardH={130} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── VIDEO ZONE ────────────────────────────────────────────────────── */}
        {allVideos.length > 0 && (
          <VideoZone dames={damesVideos} heren={herenVideos} fih={fihVideos} />
        )}

      </div>
    </>
  )
}

/* ─── HERO SECTION ────────────────────────────────────────────────────────── */
function HeroSection({ article }: { article: Article }) {
  const [hov, setHov] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)
  const text = (getText(article) || '').slice(0, 180).trim() + '…'
  const source = getArticleSource(article)

  return (
    <div style={{ position: 'relative', background: 'linear-gradient(135deg, #060810 0%, #001080 50%, #060810 100%)', overflow: 'hidden', minHeight: 600 }}>
      {/* Background image */}
      {article.image_url && (
        <div style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
          <img src={article.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Giant ball - top right */}
      <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: '#94FF00', opacity: 0.12, filter: 'blur(60px)', pointerEvents: 'none' }} />
      {/* Small solid ball accent */}
      <div style={{ position: 'absolute', top: 40, right: 80, width: 18, height: 18, borderRadius: '50%', background: '#94FF00', opacity: 0.9, animation: 'float 4s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 120, right: 180, width: 8, height: 8, borderRadius: '50%', background: '#94FF00', opacity: 0.5, animation: 'float 6s ease-in-out infinite 1s', pointerEvents: 'none' }} />

      {/* Layered triangles - bottom left */}
      <LayeredTriangles style={{ bottom: -40, left: -20, opacity: 0.9 }} />

      {/* Pill/oval shape */}
      <div style={{ position: 'absolute', bottom: -300, right: -100, width: 400, height: 900, borderRadius: 200, background: 'linear-gradient(180deg, rgba(217,217,217,0.04) 0%, rgba(255,255,255,0.01) 100%)', transform: 'rotate(-89.93deg)', pointerEvents: 'none' }} />

      {/* Content */}
      <div className="pw" style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', minHeight: 600, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720 }}>
          {/* Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <span style={{ background: '#94FF00', color: '#000', fontSize: 9, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100 }}>Top Story</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>{source.flag} {source.country}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>·</span>
            <Clock size={10} color="rgba(255,255,255,0.35)" />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 }}>{timeAgo(article.scraped_at)}</span>
          </div>

          {/* Title */}
          <Link href={`/article/${slug}`} style={{ textDecoration: 'none' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-2px', color: hov ? '#94FF00' : '#fff', marginBottom: 20, transition: 'color .2s', maxWidth: 660 }}>
              {title}
            </h1>
          </Link>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: 32, maxWidth: 540 }}>{text}</p>

          {/* Glass CTA */}
          <Link href={`/article/${slug}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 100, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 0.5, transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#94FF00'; e.currentTarget.style.color = '#000'; e.currentTarget.style.borderColor = '#94FF00' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
          >
            Read full story <ExternalLink size={13} />
          </Link>
        </div>

        {/* Hero image card - glass effect */}
        {article.image_url && (
          <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', width: 360, borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', display: 'none' }}>
            <img src={article.image_url} alt={title} style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }} />
          </div>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, transparent, var(--bg-dark))', pointerEvents: 'none' }} />
    </div>
  )
}

/* ─── NL EDITORIAL ────────────────────────────────────────────────────────── */
function NLEditorial({ articles }: { articles: Article[] }) {
  const featured = articles[0]
  const rest = articles.slice(1, 5)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 290px)', gap: 16, alignItems: 'stretch' }}>
      <NLFeatured article={featured} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rest.map(a => <ListCard key={a.id} article={a} />)}
      </div>
    </div>
  )
}

function NLFeatured({ article }: { article: Article }) {
  const [hov, setHov] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)
  const text = (getText(article) || '').slice(0, 130).trim() + '…'
  const source = getArticleSource(article)
  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ position: 'relative', height: '100%', minHeight: 360, borderRadius: 20, overflow: 'hidden' }}>
        {article.image_url
          ? <img src={article.image_url} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .7s', transform: hov ? 'scale(1.04)' : 'scale(1)' }} />
          : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#001080,#060810)' }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 55%, transparent 75%)' }} />
        {/* Green ball accent */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: '#94FF00', opacity: 0.15, filter: 'blur(30px)' }} />
        <div style={{ position: 'absolute', top: 16, left: 16 }}>
          <span style={{ background: 'rgba(148,255,0,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(148,255,0,0.3)', color: '#94FF00', fontSize: 9, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 100 }}>{source.flag} {source.country}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', marginBottom: 10, letterSpacing: 0.5 }}>{timeAgo(article.scraped_at)}</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 2.2vw, 26px)', fontWeight: 800, lineHeight: 1.2, color: hov ? '#94FF00' : '#fff', margin: '0 0 10px', transition: 'color .2s', letterSpacing: '-0.5px' }}>{title}</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.48)', lineHeight: 1.65, margin: 0 }}>{text}</p>
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
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', flex: 1 }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ display: 'flex', gap: 12, padding: '10px', borderRadius: 14, border: `1px solid ${hov ? 'rgba(148,255,0,0.3)' : 'var(--border)'}`, background: hov ? 'rgba(148,255,0,0.04)' : 'var(--bg-card)', transition: 'all .2s', height: '100%' }}>
        <div style={{ width: 72, height: 54, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#111' }}>
          {article.image_url && <img src={article.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s', transform: hov ? 'scale(1.08)' : 'scale(1)' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 5, letterSpacing: 0.3 }}>{timeAgo(article.scraped_at)}</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: hov ? '#94FF00' : 'var(--text-primary)', transition: 'color .2s', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</p>
        </div>
      </div>
    </Link>
  )
}

/* ─── GB GRID ─────────────────────────────────────────────────────────────── */
function GBGrid({ articles }: { articles: Article[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {articles.map(a => <GBCard key={a.id} article={a} />)}
    </div>
  )
}
function GBCard({ article }: { article: Article }) {
  const [hov, setHov] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)
  const text = (getText(article) || '').slice(0, 90).trim() + '…'
  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className="card-lift" style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${hov ? 'rgba(148,255,0,0.25)' : 'var(--border)'}`, background: 'var(--bg-card)', transition: 'border-color .2s' }}>
        <div style={{ height: 170, overflow: 'hidden', background: '#0a0d18', position: 'relative' }}>
          {article.image_url
            ? <img src={article.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s', transform: hov ? 'scale(1.06)' : 'scale(1)' }} />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#001080,#060810)' }} />
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
        </div>
        <div style={{ padding: '14px 15px 16px' }}>
          <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 7, letterSpacing: 0.3 }}>{timeAgo(article.scraped_at)}</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, lineHeight: 1.4, color: hov ? '#94FF00' : 'var(--text-primary)', transition: 'color .2s', margin: '0 0 7px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</p>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{text}</p>
        </div>
      </div>
    </Link>
  )
}

/* ─── SCROLL ROW ──────────────────────────────────────────────────────────── */
function ScrollRow({ articles, cardH }: { articles: Article[]; cardH: number }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div ref={ref} className="art-row">
      {articles.map(a => <MiniCard key={a.id} article={a} height={cardH} />)}
    </div>
  )
}
function MiniCard({ article, height }: { article: Article; height: number }) {
  const [hov, setHov] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)
  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', flexShrink: 0, width: 185 }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div className="card-lift" style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${hov ? 'rgba(148,255,0,0.25)' : 'var(--border)'}`, background: 'var(--bg-card)', transition: 'border-color .2s' }}>
        <div style={{ height, overflow: 'hidden', background: '#0a0d18' }}>
          {article.image_url && <img src={article.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s', transform: hov ? 'scale(1.06)' : 'scale(1)' }} />}
        </div>
        <div style={{ padding: '10px 12px 13px' }}>
          <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 5 }}>{timeAgo(article.scraped_at)}</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: hov ? '#94FF00' : 'var(--text-primary)', transition: 'color .2s', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>{title}</p>
        </div>
      </div>
    </Link>
  )
}

/* ─── COMPACT LIST ────────────────────────────────────────────────────────── */
function CompactList({ articles }: { articles: Article[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {articles.map(a => <CompactRow key={a.id} article={a} />)}
    </div>
  )
}
function CompactRow({ article }: { article: Article }) {
  const [hov, setHov] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)
  const text = (getText(article) || '').slice(0, 80).trim() + '…'
  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ display: 'flex', gap: 14, padding: '13px 14px', borderRadius: 14, border: `1px solid ${hov ? 'rgba(148,255,0,0.25)' : 'var(--border)'}`, background: hov ? 'rgba(148,255,0,0.03)' : 'transparent', transition: 'all .2s', alignItems: 'center' }}>
        <div style={{ width: 90, height: 62, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#0a0d18' }}>
          {article.image_url && <img src={article.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s', transform: hov ? 'scale(1.07)' : 'scale(1)' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 5 }}>{timeAgo(article.scraped_at)}</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, lineHeight: 1.4, color: hov ? '#94FF00' : 'var(--text-primary)', transition: 'color .2s', margin: '0 0 4px' }}>{title}</p>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{text}</p>
        </div>
      </div>
    </Link>
  )
}

/* ─── IRELAND GRID ────────────────────────────────────────────────────────── */
function IrelandGrid({ articles }: { articles: Article[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {articles.map(a => <IrelandCard key={a.id} article={a} />)}
    </div>
  )
}
function IrelandCard({ article }: { article: Article }) {
  const [hov, setHov] = useState(false)
  const slug = getSlug(article)
  const title = getTitle(article)
  const text = (getText(article) || '').slice(0, 110).trim() + '…'
  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ position: 'relative', height: 270, borderRadius: 18, overflow: 'hidden' }}>
        {article.image_url
          ? <img src={article.image_url} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .6s', transform: hov ? 'scale(1.05)' : 'scale(1)' }} />
          : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#001080,#060810)' }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.1) 60%, transparent 80%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '18px 20px' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.38)', marginBottom: 7 }}>{timeAgo(article.scraped_at)}</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, lineHeight: 1.3, color: hov ? '#94FF00' : '#fff', transition: 'color .2s', margin: '0 0 6px', letterSpacing: '-0.3px' }}>{title}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{text}</p>
        </div>
      </div>
    </Link>
  )
}

/* ─── INTERNATIONAL MATCHES SIDEBAR ──────────────────────────────────────── */
function IntlMatchSection({ menData, womenData }: { menData: MatchData | null; womenData: MatchData | null }) {
  const [gender, setGender] = useState<'men' | 'women'>('men')
  const [tab, setTab]       = useState<'results' | 'upcoming'>('results')
  const data = gender === 'men' ? menData : womenData
  const matches = (data ? (tab === 'results' ? data.results : data.upcoming) : []).slice(0, 5)

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', background: 'var(--bg-card)' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>🌍 International</span>
        <Link href="/competition" style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', textDecoration: 'none' }}>All →</Link>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {(['men', 'women'] as const).map(g => (
          <button key={g} onClick={() => setGender(g)} style={{ flex: 1, padding: '10px', border: 'none', background: gender === g ? 'var(--green)' : 'transparent', color: gender === g ? '#000' : 'var(--text-secondary)', fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s', fontFamily: 'var(--font-display)' }}>
            {g === 'men' ? '♂ Men' : '♀ Women'}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {(['results', 'upcoming'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', border: 'none', background: tab === t ? 'var(--green)' : 'transparent', color: tab === t ? '#000' : 'var(--text-secondary)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s' }}>
            {t === 'results' ? 'Results' : 'Upcoming'}
          </button>
        ))}
      </div>
      <div style={{ padding: '12px 14px 14px', overflowY: 'auto', maxHeight: 490, scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}>
        {!menData && !womenData
          ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '14px', background: 'var(--bg-card-2)', opacity: 0.5 }}>
                  <div style={{ height: 8, width: '60%', background: 'var(--border)', borderRadius: 4, marginBottom: 12 }} />
                  <div style={{ height: 10, width: '80%', background: 'var(--border)', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ height: 10, width: '70%', background: 'var(--border)', borderRadius: 4 }} />
                </div>
              ))}
            </div>
          : matches.length === 0
            ? <p style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '12px 0', textAlign: 'center' }}>No {tab === 'results' ? 'results' : 'upcoming matches'}</p>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {matches.map(m => <MatchRow key={m.id} match={m} isResult={tab === 'results'} />)}
              </div>
        }
      </div>
    </div>
  )
}
function MatchRow({ match: m, isResult }: { match: Match; isResult: boolean }) {
  const homeWon = isResult && m.score ? m.score.home > m.score.away : false
  const awayWon = isResult && m.score ? m.score.away > m.score.home : false
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: 7, background: 'var(--bg-card-2)' }}>
      <div style={{ fontSize: 9, color: isResult ? 'var(--text-secondary)' : 'var(--green)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
        {isResult ? `Final · ${fmtMatchDate(m.date)}` : `Upcoming · ${fmtMatchDate(m.date)}`}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <TeamLogo logo={m.home.logo} name={m.home.name} />
        <span style={{ flex: 1, fontSize: 12, fontWeight: homeWon ? 800 : 400, color: homeWon ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home.name}</span>
        {isResult && m.score && <span style={{ fontSize: 16, fontWeight: 900, color: homeWon ? 'var(--green)' : 'var(--text-secondary)', minWidth: 18, textAlign: 'right' }}>{m.score.home}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <TeamLogo logo={m.away.logo} name={m.away.name} />
        <span style={{ flex: 1, fontSize: 12, fontWeight: awayWon ? 800 : 400, color: awayWon ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.away.name}</span>
        {isResult && m.score && <span style={{ fontSize: 16, fontWeight: 900, color: awayWon ? 'var(--green)' : 'var(--text-secondary)', minWidth: 18, textAlign: 'right' }}>{m.score.away}</span>}
      </div>
    </div>
  )
}
function TeamLogo({ logo, name }: { logo: string | null; name: string }) {
  return (
    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
      {logo ? <img src={logo} alt={name} style={{ width: 16, height: 16, objectFit: 'contain' }} /> : <span style={{ fontSize: 9, fontWeight: 900, color: '#333' }}>{name[0]}</span>}
    </div>
  )
}

/* ─── VIDEO ZONE ──────────────────────────────────────────────────────────── */
function VideoZone({ dames, heren, fih }: { dames: Video[]; heren: Video[]; fih: Video[] }) {
  const [tab, setTab] = useState<'dames' | 'heren' | 'fih'>('heren')
  const videos = tab === 'dames' ? dames : tab === 'heren' ? heren : fih

  const TABS = [
    { key: 'heren' as const, label: '🏑 Men',         videos: heren },
    { key: 'dames' as const, label: '🏑 Women',        videos: dames },
    { key: 'fih'   as const, label: '🌍 FIH',          videos: fih   },
  ].filter(t => t.videos.length > 0)

  const ref = useRef<HTMLDivElement>(null)
  const scroll = (d: 'left' | 'right') => ref.current?.scrollBy({ left: d === 'left' ? -270 : 270, behavior: 'smooth' })

  return (
    <section style={{ position: 'relative', background: 'linear-gradient(180deg, var(--bg-dark) 0%, #001060 40%, #000d50 100%)', overflow: 'hidden', padding: '80px 0 100px', marginTop: 24 }}>
      {/* Decorative elements */}
      <div style={{ position: 'absolute', top: -150, right: -150, width: 500, height: 500, borderRadius: '50%', background: '#94FF00', opacity: 0.08, filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: '#003ad0', opacity: 0.3, filter: 'blur(60px)', pointerEvents: 'none' }} />
      <LayeredTriangles style={{ top: 30, right: 40, transform: 'scaleX(-1)' }} />
      {/* Small ball dots */}
      <div style={{ position: 'absolute', top: 60, left: '15%', width: 12, height: 12, borderRadius: '50%', background: '#94FF00', opacity: 0.6, animation: 'float 5s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: 140, left: '30%', width: 6, height: 6, borderRadius: '50%', background: '#94FF00', opacity: 0.35, animation: 'float 7s ease-in-out infinite 2s' }} />

      <div className="pw" style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 32, height: 3, background: '#94FF00', borderRadius: 2 }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#94FF00' }}>Video Zone</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.05 }}>
              Watch Hockey
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/videos" style={{ fontSize: 11, fontWeight: 700, color: '#94FF00', textDecoration: 'none', letterSpacing: 1, marginRight: 8 }}>All videos →</Link>
            {(['left', 'right'] as const).map(d => (
              <button key={d} onClick={() => scroll(d)} style={{ width: 32, height: 32, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#94FF00'; e.currentTarget.style.color = '#000'; e.currentTarget.style.borderColor = '#94FF00' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
              >
                {d === 'left' ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        {TABS.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '8px 18px', borderRadius: 100, border: `1px solid ${tab === t.key ? '#94FF00' : 'rgba(255,255,255,0.12)'}`, background: tab === t.key ? '#94FF00' : 'rgba(255,255,255,0.05)', color: tab === t.key ? '#000' : 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s', fontFamily: 'var(--font-display)' }}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Video scroll */}
        <div ref={ref} style={{ display: 'flex', gap: 14, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
          {videos.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      </div>
    </section>
  )
}

function VideoCard({ video }: { video: Video }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={video.youtube_url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, width: 250, textDecoration: 'none' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${hov ? 'rgba(148,255,0,0.35)' : 'rgba(255,255,255,0.08)'}`, background: 'rgba(255,255,255,0.04)', transition: 'transform .25s, box-shadow .25s, border-color .2s', transform: hov ? 'translateY(-4px)' : 'none', boxShadow: hov ? '0 20px 48px rgba(0,0,0,0.5)' : 'none' }}>
        <div style={{ position: 'relative', height: 145, overflow: 'hidden', background: '#000' }}>
          <img src={video.thumbnail_url} alt={getVideoTitle(video)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .4s', transform: hov ? 'scale(1.06)' : 'scale(1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: hov ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: hov ? '#94FF00' : 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s', backdropFilter: 'blur(8px)' }}>
              <Play size={16} fill={hov ? '#000' : '#fff'} color={hov ? '#000' : '#fff'} style={{ marginLeft: 2 }} />
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 14px 15px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: hov ? '#94FF00' : '#fff', transition: 'color .2s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>{getVideoTitle(video)}</p>
        </div>
      </div>
    </a>
  )
}
