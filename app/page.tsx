'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { getArticles, Article, getVideos, Video, getTitle, getText, getSlug, getVideoTitle } from '@/lib/supabase'
import { Play, ChevronLeft, ChevronRight, Clock } from 'lucide-react'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (h < 1) return 'Práve teraz'
  if (h < 24) return `pred ${h}h`
  return `pred ${d}d`
}

export default function Home() {
  const [articles, setArticles]       = useState<Article[]>([])
  const [damesVideos, setDamesVideos] = useState<Video[]>([])
  const [herenVideos, setHerenVideos] = useState<Video[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([getArticles(20), getVideos('dames', 10), getVideos('heren', 10)])
      .then(([arts, dames, heren]) => {
        setArticles(arts); setDamesVideos(dames); setHerenVideos(heren); setLoading(false)
      }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '2px solid rgba(255,255,255,0.1)', borderTop: '2px solid #00FF87', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const [hero, ...rest] = articles
  const secondary = rest.slice(0, 3)
  const grid      = rest.slice(3, 9)

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .page-wrap    { max-width:1200px; margin:0 auto; padding:24px 24px 100px; animation:fadeUp .4s ease; }
        .sec-grid     { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .news-grid    { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        @media(max-width:860px){
          .sec-grid  { grid-template-columns:repeat(2,1fr); }
          .news-grid { grid-template-columns:repeat(2,1fr); }
        }
        @media(max-width:520px){
          .sec-grid  { grid-template-columns:1fr; }
          .news-grid { grid-template-columns:1fr; }
        }
        .card-hover { transition: transform .25s ease, box-shadow .25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,.5); }
        .img-zoom img { transition: transform .6s ease; }
        .img-zoom:hover img { transform: scale(1.05); }
        .title-hover { transition: color .2s ease; }
        .card-hover:hover .title-hover { color: #00FF87 !important; }
      `}</style>

      <div className="page-wrap">

        {/* ═══ HERO ═══════════════════════════════════════════════════════ */}
        {hero && <HeroCard article={hero} />}

        {/* ═══ SECONDARY 3 ════════════════════════════════════════════════ */}
        {secondary.length > 0 && (
          <div className="sec-grid" style={{ marginTop: 16, marginBottom: 48 }}>
            {secondary.map(a => <SecondaryCard key={a.id} article={a} />)}
          </div>
        )}

        {/* ═══ DIVIDER ════════════════════════════════════════════════════ */}
        {grid.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Ďalšie správy</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div className="news-grid" style={{ marginBottom: 60 }}>
              {grid.map(a => <GridCard key={a.id} article={a} />)}
            </div>
          </>
        )}

        {/* ═══ VIDEOS ═════════════════════════════════════════════════════ */}
        {damesVideos.length > 0 && <VideoCarousel label="Hoofdklasse Dames" videos={damesVideos} />}
        {herenVideos.length > 0  && <VideoCarousel label="Hoofdklasse Heren" videos={herenVideos} />}
      </div>
    </>
  )
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
function HeroCard({ article }: { article: Article }) {
  const [hov, setHov] = useState(false)
  const slug  = getSlug(article)
  const title = getTitle(article)
  const text  = (getText(article) || '').slice(0, 180).trim() + '…'

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 16, borderRadius: 20, overflow: 'hidden' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div style={{ position: 'relative', height: 520, overflow: 'hidden', borderRadius: 20, cursor: 'pointer' }}>
        {/* Image */}
        {article.image_url
          ? <img src={article.image_url} alt={title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .7s ease', transform: hov ? 'scale(1.04)' : 'scale(1)' }} />
          : <div style={{ position: 'absolute', inset: 0, background: '#111' }} />
        }

        {/* Gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0) 20%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }} />

        {/* Badge */}
        <div style={{ position: 'absolute', top: 24, left: 24 }}>
          <span style={{ background: '#00FF87', color: '#000', fontSize: 10, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 6 }}>
            Hlavná správa
          </span>
        </div>

        {/* Content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Clock size={11} color="rgba(255,255,255,0.5)" />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>{timeAgo(article.scraped_at)}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px', color: '#fff', marginBottom: 14, maxWidth: 760, transition: 'color .2s', ...(hov ? { color: '#00FF87' } : {}) }}>
            {title}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: 640 }}>
            {text}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 20, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, padding: '8px 18px', fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>
            Čítať článok →
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ─── Secondary card ─────────────────────────────────────────────────────── */
function SecondaryCard({ article }: { article: Article }) {
  const slug  = getSlug(article)
  const title = getTitle(article)

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none' }}>
      <div className="card-hover img-zoom" style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', cursor: 'pointer' }}>
        <div style={{ height: 190, overflow: 'hidden', position: 'relative' }}>
          {article.image_url
            ? <img src={article.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', background: '#111' }} />
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
        </div>
        <div style={{ padding: '16px 18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#00FF87' }} />
            <span style={{ fontSize: 10, color: '#00FF87', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>{timeAgo(article.scraped_at)}</span>
          </div>
          <h3 className="title-hover" style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.35, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {title}
          </h3>
        </div>
      </div>
    </Link>
  )
}

/* ─── Grid card ──────────────────────────────────────────────────────────── */
function GridCard({ article }: { article: Article }) {
  const slug  = getSlug(article)
  const title = getTitle(article)

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none' }}>
      <div className="card-hover img-zoom" style={{ borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', cursor: 'pointer' }}>
        <div style={{ height: 165, overflow: 'hidden', position: 'relative' }}>
          {article.image_url
            ? <img src={article.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', background: '#111' }} />
          }
        </div>
        <div style={{ padding: '13px 15px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#00FF87' }} />
            <span style={{ fontSize: 9, color: '#00FF87', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>{timeAgo(article.scraped_at)}</span>
          </div>
          <h3 className="title-hover" style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.35, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {title}
          </h3>
        </div>
      </div>
    </Link>
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
          <div style={{ flex: 1, height: 1, background: 'var(--border)', width: 40 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/videos" style={{ fontSize: 11, fontWeight: 700, color: '#00FF87', textDecoration: 'none', letterSpacing: 1 }}>Všetky →</Link>
          {(['left', 'right'] as const).map(d => (
            <button key={d} onClick={() => scroll(d)} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .2s, color .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#00FF87'; e.currentTarget.style.color = '#00FF87' }}
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
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', transition: 'transform .25s, box-shadow .25s', transform: hov ? 'translateY(-3px)' : 'none', boxShadow: hov ? '0 16px 40px rgba(0,0,0,.5)' : 'none' }}>
        <div style={{ position: 'relative', height: 135, overflow: 'hidden', background: '#0a0a0a' }}>
          <img src={video.thumbnail_url} alt={getVideoTitle(video)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .4s', transform: hov ? 'scale(1.06)' : 'scale(1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: hov ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: hov ? '#00FF87' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s', boxShadow: hov ? '0 0 20px rgba(0,255,135,0.4)' : 'none' }}>
              <Play size={15} fill={hov ? '#000' : '#fff'} color={hov ? '#000' : '#fff'} style={{ marginLeft: 2 }} />
            </div>
          </div>
        </div>
        <div style={{ padding: '11px 13px 14px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: hov ? '#00FF87' : 'var(--text-primary)', transition: 'color .2s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {getVideoTitle(video)}
          </p>
        </div>
      </div>
    </a>
  )
}
