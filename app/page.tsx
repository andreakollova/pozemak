'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { getArticles, Article, getVideos, Video, getTitle, getText, getSlug, getVideoTitle } from '@/lib/supabase'
import { Play, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [damesVideos, setDamesVideos] = useState<Video[]>([])
  const [herenVideos, setHerenVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getArticles(20),
      getVideos('dames', 10),
      getVideos('heren', 10),
    ]).then(([arts, dames, heren]) => {
      setArticles(arts)
      setDamesVideos(dames)
      setHerenVideos(heren)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44, height: 44, border: '3px solid var(--border)',
            borderTop: '3px solid var(--green)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'var(--text-secondary)', letterSpacing: 3, textTransform: 'uppercase', fontSize: 11 }}>Načítavam…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    )
  }

  const featured = articles[0]
  const sideNews  = articles.slice(1, 4)
  const gridNews  = articles.slice(4, 10)

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px 100px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .hero-grid { display: grid; grid-template-columns: 1fr 360px; gap: 16px; align-items: stretch; }
        .news-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px; }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; }
          .news-grid  { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .news-grid  { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── Section label ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 3, height: 22, background: 'var(--green)', borderRadius: 2 }} />
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          Najnovšie správy
        </span>
      </div>

      {/* ── Hero + side ── */}
      {featured && (
        <div className="hero-grid">
          <HeroCard article={featured} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sideNews.map(a => <SideCard key={a.id} article={a} />)}
          </div>
        </div>
      )}

      {/* ── Grid rows ── */}
      {gridNews.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '40px 0 20px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 3, textTransform: 'uppercase' }}>Ďalšie správy</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <div className="news-grid">
            {gridNews.map(a => <GridCard key={a.id} article={a} />)}
          </div>
        </>
      )}

      {/* ── Video karusely ── */}
      {damesVideos.length > 0 && (
        <VideoCarousel title="Hoofdklasse" accent="Dames" videos={damesVideos} />
      )}
      {herenVideos.length > 0 && (
        <VideoCarousel title="Hoofdklasse" accent="Heren" videos={herenVideos} />
      )}
    </main>
  )
}

/* ── Hero card ─────────────────────────────────────────────────────────────── */
function HeroCard({ article }: { article: Article }) {
  const [hovered, setHovered] = useState(false)
  const slug    = getSlug(article)
  const title   = getTitle(article)
  const excerpt = (getText(article) || '').slice(0, 200).trim() + '…'

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        className="glass"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 18, overflow: 'hidden', height: '100%',
          display: 'flex', flexDirection: 'column',
          transition: 'box-shadow 0.3s',
          boxShadow: hovered ? '0 0 0 1px var(--green), 0 20px 60px rgba(0,255,135,0.1)' : '0 0 0 1px transparent',
          cursor: 'pointer',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', flex: '1 1 0', minHeight: 320, overflow: 'hidden' }}>
          {article.image_url
            ? <img src={article.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s', transform: hovered ? 'scale(1.03)' : 'scale(1)' }} />
            : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.03)' }} />
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,8,0.96) 0%, rgba(8,8,8,0.15) 55%, transparent 100%)' }} />
          <span style={{ position: 'absolute', top: 18, left: 18, background: 'var(--green)', color: '#000', fontSize: 10, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 4 }}>
            Hlavná správa
          </span>
        </div>
        {/* Content */}
        <div style={{ padding: '22px 26px 26px', flexShrink: 0 }}>
          <p style={{ fontSize: 10, color: 'var(--green)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
            {formatDate(article.scraped_at)}
          </p>
          <h2 style={{ fontSize: 'clamp(18px, 2.2vw, 28px)', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: 12, color: 'var(--text-primary)' }}>
            {title}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 16 }}>
            {excerpt}
          </p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--green)' }}>
            Čítať ďalej <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ── Side card ─────────────────────────────────────────────────────────────── */
function SideCard({ article }: { article: Article }) {
  const [hovered, setHovered] = useState(false)
  const slug  = getSlug(article)
  const title = getTitle(article)

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', flex: 1, display: 'flex', minHeight: 0 }}>
      <div
        className="glass"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 14, overflow: 'hidden', width: '100%',
          display: 'flex', cursor: 'pointer',
          transition: 'box-shadow 0.2s',
          boxShadow: hovered ? '0 0 0 1px var(--green)' : '0 0 0 1px transparent',
        }}
      >
        {/* Thumbnail */}
        {article.image_url && (
          <div style={{ width: 100, flexShrink: 0, overflow: 'hidden' }}>
            <img src={article.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s', transform: hovered ? 'scale(1.08)' : 'scale(1)' }} />
          </div>
        )}
        {/* Text */}
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, flex: 1 }}>
          <p style={{ fontSize: 10, color: 'var(--green)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>
            {formatDate(article.scraped_at)}
          </p>
          <h3 style={{
            fontSize: 13, fontWeight: 800, lineHeight: 1.4, color: 'var(--text-primary)',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {title}
          </h3>
        </div>
      </div>
    </Link>
  )
}

/* ── Grid card ─────────────────────────────────────────────────────────────── */
function GridCard({ article }: { article: Article }) {
  const [hovered, setHovered] = useState(false)
  const slug  = getSlug(article)
  const title = getTitle(article)

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="glass"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
          transition: 'box-shadow 0.2s',
          boxShadow: hovered ? '0 0 0 1px var(--green)' : '0 0 0 1px transparent',
        }}
      >
        <div style={{ height: 190, overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
          {article.image_url && (
            <img src={article.image_url} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }} />
          )}
        </div>
        <div style={{ padding: '16px 18px 20px' }}>
          <p style={{ fontSize: 10, color: 'var(--green)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            {formatDate(article.scraped_at)}
          </p>
          <h3 style={{
            fontSize: 15, fontWeight: 800, lineHeight: 1.35, color: 'var(--text-primary)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {title}
          </h3>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 12, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: hovered ? 'var(--green)' : 'var(--text-secondary)', transition: 'color 0.2s' }}>
            Čítať <ArrowUpRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ── Video carousel ────────────────────────────────────────────────────────── */
function VideoCarousel({ title, accent, videos }: { title: string; accent: string; videos: Video[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })

  return (
    <div style={{ marginTop: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 3, height: 22, background: 'var(--green)', borderRadius: 2 }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            {title} <span style={{ color: 'var(--green)' }}>{accent}</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/videos"
            style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, textDecoration: 'none' }}
            onMouseEnter={(e: any) => (e.currentTarget.style.color = 'var(--green)')}
            onMouseLeave={(e: any) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >Všetky →</Link>
          {(['left', 'right'] as const).map(dir => (
            <button key={dir} onClick={() => scroll(dir)} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {dir === 'left' ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
            </button>
          ))}
        </div>
      </div>
      <div ref={scrollRef} style={{ display: 'flex', gap: 14, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {videos.map(v => <VideoCard key={v.id} video={v} />)}
      </div>
    </div>
  )
}

function VideoCard({ video }: { video: Video }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a href={video.youtube_url} target="_blank" rel="noopener noreferrer"
      style={{ textDecoration: 'none', flexShrink: 0, width: 256 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div className="glass" style={{ borderRadius: 12, overflow: 'hidden', transition: 'box-shadow 0.2s', boxShadow: hovered ? '0 0 0 1px var(--green)' : '0 0 0 1px transparent' }}>
        <div style={{ position: 'relative', aspectRatio: '16/9', background: '#111', overflow: 'hidden' }}>
          <img src={video.thumbnail_url} alt={getVideoTitle(video)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s', transform: hovered ? 'scale(1.04)' : 'scale(1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: hovered ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: hovered ? 'var(--green)' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
              <Play size={15} fill={hovered ? '#000' : '#fff'} color={hovered ? '#000' : '#fff'} style={{ marginLeft: 2 }} />
            </div>
          </div>
        </div>
        <div style={{ padding: '11px 14px 14px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {getVideoTitle(video)}
          </p>
        </div>
      </div>
    </a>
  )
}
