'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { getArticles, Article, getVideos, Video, getTitle, getText, getSlug, getVideoTitle } from '@/lib/supabase'
import { Play, ChevronLeft, ChevronRight } from 'lucide-react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long' })
}

export default function Home() {
  const [articles, setArticles]     = useState<Article[]>([])
  const [damesVideos, setDamesVideos] = useState<Video[]>([])
  const [herenVideos, setHerenVideos] = useState<Video[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([getArticles(20), getVideos('dames', 10), getVideos('heren', 10)])
      .then(([arts, dames, heren]) => { setArticles(arts); setDamesVideos(dames); setHerenVideos(heren); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 36, height: 36, border: '2px solid var(--border)', borderTop: '2px solid var(--green)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const hero    = articles[0]
  const side    = articles.slice(1, 4)
  const grid    = articles.slice(4, 10)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 100px' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .h-grid { display:grid; grid-template-columns:1fr 300px; gap:1px; background:var(--border); border:1px solid var(--border); }
        .n-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--border); }
        .s-col  { display:flex; flex-direction:column; }
        img { display:block; width:100%; height:100%; object-fit:cover; }
        @media(max-width:860px){ .h-grid{grid-template-columns:1fr} .n-grid{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:520px){ .n-grid{grid-template-columns:1fr} }
      `}</style>

      {/* ── HERO SECTION ── */}
      {hero && (
        <>
          <SectionLabel label="Najnovšie správy" />
          <div className="h-grid" style={{ marginBottom: 32 }}>

            {/* Hero card */}
            <HeroCard article={hero} />

            {/* Side cards */}
            <div className="s-col" style={{ background: 'var(--bg-dark)' }}>
              {side.map((a, i) => (
                <SideCard key={a.id} article={a} last={i === side.length - 1} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── GRID ── */}
      {grid.length > 0 && (
        <>
          <SectionLabel label="Ďalšie správy" />
          <div className="n-grid" style={{ border: '1px solid var(--border)', marginBottom: 48 }}>
            {grid.map(a => <GridCard key={a.id} article={a} />)}
          </div>
        </>
      )}

      {/* ── VIDEOS ── */}
      {damesVideos.length > 0 && <VideoCarousel label="Hoofdklasse Dames" videos={damesVideos} />}
      {herenVideos.length > 0 && <VideoCarousel label="Hoofdklasse Heren" videos={herenVideos} />}
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{ width: 3, height: 16, background: 'var(--green)', borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
        {label}
      </span>
    </div>
  )
}

/* ─── Hero card ──────────────────────────────────────────────────────────── */
function HeroCard({ article }: { article: Article }) {
  const [hov, setHov] = useState(false)
  const slug  = getSlug(article)
  const title = getTitle(article)
  const text  = (getText(article) || '').slice(0, 200).trim() + '…'

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      {/* Image */}
      <div style={{ height: 400, overflow: 'hidden', flexShrink: 0 }}>
        {article.image_url
          ? <img src={article.image_url} alt={title} style={{ transition: 'transform 0.5s', transform: hov ? 'scale(1.03)' : 'scale(1)' }} />
          : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.04)' }} />
        }
      </div>
      {/* Content */}
      <div style={{ padding: '20px 22px 24px', flex: 1, borderTop: '3px solid var(--green)' }}>
        <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>
          Hlavná správa · {formatDate(article.scraped_at)}
        </span>
        <h2 style={{ fontSize: 'clamp(18px, 2vw, 26px)', fontWeight: 900, lineHeight: 1.18, letterSpacing: '-0.5px', margin: '10px 0 12px', color: hov ? 'var(--green)' : 'var(--text-primary)', transition: 'color 0.2s' }}>
          {title}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{text}</p>
      </div>
    </Link>
  )
}

/* ─── Side card ──────────────────────────────────────────────────────────── */
function SideCard({ article, last }: { article: Article; last: boolean }) {
  const [hov, setHov] = useState(false)
  const slug  = getSlug(article)
  const title = getTitle(article)

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', flex: 1, display: 'flex', flexDirection: 'column', borderBottom: last ? 'none' : '1px solid var(--border)' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div style={{ height: 130, overflow: 'hidden', flexShrink: 0 }}>
        {article.image_url
          ? <img src={article.image_url} alt={title} style={{ transition: 'transform 0.4s', transform: hov ? 'scale(1.05)' : 'scale(1)' }} />
          : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.04)' }} />
        }
      </div>
      <div style={{ padding: '12px 16px 14px', flex: 1, borderTop: '2px solid var(--border)' }}>
        <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
          {formatDate(article.scraped_at)}
        </span>
        <h3 style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.4, color: hov ? 'var(--green)' : 'var(--text-primary)', transition: 'color 0.2s', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {title}
        </h3>
      </div>
    </Link>
  )
}

/* ─── Grid card ──────────────────────────────────────────────────────────── */
function GridCard({ article }: { article: Article }) {
  const [hov, setHov] = useState(false)
  const slug  = getSlug(article)
  const title = getTitle(article)

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div style={{ height: 175, overflow: 'hidden', flexShrink: 0 }}>
        {article.image_url
          ? <img src={article.image_url} alt={title} style={{ transition: 'transform 0.4s', transform: hov ? 'scale(1.04)' : 'scale(1)' }} />
          : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.04)' }} />
        }
      </div>
      <div style={{ padding: '13px 15px 16px', flex: 1, borderTop: '2px solid var(--border)' }}>
        <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
          {formatDate(article.scraped_at)}
        </span>
        <h3 style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.35, color: hov ? 'var(--green)' : 'var(--text-primary)', transition: 'color 0.2s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {title}
        </h3>
      </div>
    </Link>
  )
}

/* ─── Video carousel ─────────────────────────────────────────────────────── */
function VideoCarousel({ label, videos }: { label: string; videos: Video[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (d: 'left' | 'right') => ref.current?.scrollBy({ left: d === 'left' ? -270 : 270, behavior: 'smooth' })

  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <SectionLabel label={label} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/videos" style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', textDecoration: 'none', letterSpacing: 1 }}>Všetky →</Link>
          {(['left','right'] as const).map(d => (
            <button key={d} onClick={() => scroll(d)} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 4, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {d === 'left' ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
            </button>
          ))}
        </div>
      </div>
      <div ref={ref} style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {videos.map(v => <VideoCard key={v.id} video={v} />)}
      </div>
    </div>
  )
}

function VideoCard({ video }: { video: Video }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={video.youtube_url} target="_blank" rel="noopener noreferrer"
      style={{ flexShrink: 0, width: 240, textDecoration: 'none', border: '1px solid var(--border)', display: 'block', background: 'rgba(255,255,255,0.02)' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div style={{ position: 'relative', height: 135, overflow: 'hidden', background: '#111' }}>
        <img src={video.thumbnail_url} alt={getVideoTitle(video)} style={{ transition: 'transform 0.4s', transform: hov ? 'scale(1.05)' : 'scale(1)' }} />
        <div style={{ position: 'absolute', inset: 0, background: hov ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: hov ? 'var(--green)' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
            <Play size={14} fill={hov ? '#000' : '#fff'} color={hov ? '#000' : '#fff'} style={{ marginLeft: 2 }} />
          </div>
        </div>
      </div>
      <div style={{ padding: '10px 12px 13px', borderTop: '2px solid var(--border)' }}>
        <p style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: hov ? 'var(--green)' : 'var(--text-primary)', transition: 'color 0.2s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {getVideoTitle(video)}
        </p>
      </div>
    </a>
  )
}
