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
          <div style={{ width: 44, height: 44, border: '3px solid var(--border)', borderTop: '3px solid var(--green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
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
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 14px;
          align-items: stretch;
        }
        .side-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
          height: 100%;
        }
        .news-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: 14px;
        }
        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: 1fr; }
          .news-grid  { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .news-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 3, height: 20, background: 'var(--green)', borderRadius: 2 }} />
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          Najnovšie správy
        </span>
      </div>

      {/* Hero + side column */}
      {featured && (
        <div className="hero-grid">
          <HeroCard article={featured} />
          <div className="side-col">
            {sideNews.map(a => <SideCard key={a.id} article={a} />)}
          </div>
        </div>
      )}

      {/* Grid rows */}
      {gridNews.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '40px 0 20px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 3, textTransform: 'uppercase' }}>Ďalšie správy</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <div className="news-grid">
            {gridNews.map(a => <GridCard key={a.id} article={a} />)}
          </div>
        </>
      )}

      {/* Video carousels */}
      {damesVideos.length > 0 && <VideoCarousel title="Hoofdklasse" accent="Dames" videos={damesVideos} />}
      {herenVideos.length > 0 && <VideoCarousel title="Hoofdklasse" accent="Heren" videos={herenVideos} />}
    </main>
  )
}

/* ─── Hero card ──────────────────────────────────────────────────────────── */
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
          borderRadius: 16, overflow: 'hidden', height: '100%',
          display: 'flex', flexDirection: 'column', cursor: 'pointer',
          transition: 'box-shadow 0.25s',
          boxShadow: hovered ? '0 0 0 1.5px var(--green), 0 24px 60px rgba(0,255,135,0.1)' : '0 0 0 1.5px transparent',
        }}
      >
        {/* Full-height image with text overlay */}
        <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 460, overflow: 'hidden' }}>
          {article.image_url
            ? <img
                src={article.image_url}
                alt={title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.55s', transform: hovered ? 'scale(1.04)' : 'scale(1)', position: 'absolute', inset: 0 }}
              />
            : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.03)' }} />
          }
          {/* Strong gradient from bottom */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.55) 45%, rgba(8,8,8,0.1) 100%)' }} />

          {/* Badge top-left */}
          <span style={{
            position: 'absolute', top: 18, left: 18,
            background: 'var(--green)', color: '#000',
            fontSize: 10, fontWeight: 900, letterSpacing: 2.5, textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 4,
          }}>Hlavná správa</span>

          {/* Text overlaid at bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 28px 28px' }}>
            <p style={{ fontSize: 10, color: 'var(--green)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
              {formatDate(article.scraped_at)}
            </p>
            <h2 style={{ fontSize: 'clamp(18px, 2vw, 26px)', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.5px', color: '#fff', marginBottom: 12 }}>
              {title}
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 18 }}>
              {excerpt}
            </p>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--green)' }}>
              Čítať ďalej <ArrowUpRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ─── Side card (landscape image on top, title below) ───────────────────── */
function SideCard({ article }: { article: Article }) {
  const [hovered, setHovered] = useState(false)
  const slug  = getSlug(article)
  const title = getTitle(article)

  return (
    <Link href={`/article/${slug}`} style={{ textDecoration: 'none', display: 'block', flex: 1 }}>
      <div
        className="glass"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 14, overflow: 'hidden', cursor: 'pointer', height: '100%',
          display: 'flex', flexDirection: 'column',
          transition: 'box-shadow 0.2s',
          boxShadow: hovered ? '0 0 0 1.5px var(--green)' : '0 0 0 1.5px transparent',
        }}
      >
        {/* Landscape image */}
        <div style={{ width: '100%', height: 130, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.03)' }}>
          {article.image_url && (
            <img
              src={article.image_url}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s', transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
            />
          )}
        </div>

        {/* Text */}
        <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
          <p style={{ fontSize: 10, color: 'var(--green)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>
            {formatDate(article.scraped_at)}
          </p>
          <h3 style={{
            fontSize: 13, fontWeight: 800, lineHeight: 1.4, color: 'var(--text-primary)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {title}
          </h3>
        </div>
      </div>
    </Link>
  )
}

/* ─── Grid card ──────────────────────────────────────────────────────────── */
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
          borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
          transition: 'box-shadow 0.2s',
          boxShadow: hovered ? '0 0 0 1.5px var(--green)' : '0 0 0 1.5px transparent',
        }}
      >
        {/* Landscape image */}
        <div style={{ width: '100%', height: 185, overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
          {article.image_url && (
            <img
              src={article.image_url}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
            />
          )}
        </div>
        <div style={{ padding: '14px 16px 18px' }}>
          <p style={{ fontSize: 10, color: 'var(--green)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            {formatDate(article.scraped_at)}
          </p>
          <h3 style={{
            fontSize: 14, fontWeight: 800, lineHeight: 1.35, color: 'var(--text-primary)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {title}
          </h3>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 10, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: hovered ? 'var(--green)' : 'var(--text-secondary)', transition: 'color 0.2s' }}>
            Čítať <ArrowUpRight size={10} />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ─── Video carousel ─────────────────────────────────────────────────────── */
function VideoCarousel({ title, accent, videos }: { title: string; accent: string; videos: Video[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })

  return (
    <div style={{ marginTop: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 3, height: 20, background: 'var(--green)', borderRadius: 2 }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            {title} <span style={{ color: 'var(--green)' }}>{accent}</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/videos" style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 1, textDecoration: 'none' }}
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
      <div ref={scrollRef} style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
        {videos.map(v => <VideoCard key={v.id} video={v} />)}
      </div>
    </div>
  )
}

function VideoCard({ video }: { video: Video }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a href={video.youtube_url} target="_blank" rel="noopener noreferrer"
      style={{ textDecoration: 'none', flexShrink: 0, width: 250 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div className="glass" style={{ borderRadius: 12, overflow: 'hidden', transition: 'box-shadow 0.2s', boxShadow: hovered ? '0 0 0 1.5px var(--green)' : '0 0 0 1.5px transparent' }}>
        <div style={{ position: 'relative', width: '100%', height: 141, background: '#111', overflow: 'hidden' }}>
          <img src={video.thumbnail_url} alt={getVideoTitle(video)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: hovered ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: hovered ? 'var(--green)' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
              <Play size={14} fill={hovered ? '#000' : '#fff'} color={hovered ? '#000' : '#fff'} style={{ marginLeft: 2 }} />
            </div>
          </div>
        </div>
        <div style={{ padding: '10px 13px 13px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {getVideoTitle(video)}
          </p>
        </div>
      </div>
    </a>
  )
}
